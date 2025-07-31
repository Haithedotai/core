use crate::lib::extractors::ApiCaller;
use crate::lib::state::AppState;
use crate::lib::{contracts, error::ApiError, models};
use actix_web::{HttpResponse, Responder, post, web};
use alith::data::crypto::decrypt;
use alith::{Agent, Chat, HtmlKnowledge, Knowledge, PdfFileKnowledge, StringKnowledge, StructureTool, ToolError};
use chrono;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::io::Cursor;
use std::sync::Arc;
use url::Url;
use uuid;
use async_trait::async_trait;

/// Ensures a URL string has a protocol, adding https:// if missing
fn ensure_protocol(url_str: &str) -> String {
    if url_str.starts_with("http://") || url_str.starts_with("https://") {
        url_str.to_string()
    } else {
        format!("https://{}", url_str)
    }
}

#[derive(Deserialize)]
pub struct GetChatCompletionsBody {
    pub model: String,
    pub messages: Vec<serde_json::Value>,
    pub n: Option<u32>,
    pub temperature: Option<f32>,
}

#[post("/completions")]
async fn get_completions_handler(
    api_caller: ApiCaller,
    body: web::Json<GetChatCompletionsBody>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let model = body.model.clone();
    let temperature = body.temperature.unwrap_or(1.0);
    let n = body.n.unwrap_or(1);
    let messages = body.messages.clone();

    let models = models::get_models();
    let enabled_models: Vec<u64> = sqlx::query_scalar::<_, u64>(
        "SELECT model_id FROM org_model_enrollments WHERE org_id = ?",
    )
    .bind(api_caller.org_id)
    .fetch_all(&state.db)
    .await?;

    let org_address: String = sqlx::query_scalar("SELECT address FROM organizations WHERE id = ?")
        .bind(api_caller.org_id)
        .fetch_one(&state.db)
        .await?;

    let enabled_products_for_organization: Vec<ethers::types::Address> =
        contracts::get_contract("HaitheOrganization", Some(org_address.as_str()))?
            .method::<_, Vec<ethers::types::Address>>("getEnabledProducts", ())?
            .call()
            .await?;

    let enabled_products_for_project: Vec<String> =
        sqlx::query_scalar::<_, String>(
            "SELECT p.address FROM products p 
             JOIN project_products_enabled ppe ON p.id = ppe.product_id 
             WHERE ppe.project_id = ?"
        )
            .bind(api_caller.project_id)
            .fetch_all(&state.db)
            .await?;

    let enabled_products: Vec<String> = enabled_products_for_organization
        .iter()
        .map(|addr| format!("{:#x}", addr))
        .filter(|p| enabled_products_for_project.contains(p))
        .collect();

    
    let enabled_products_lowercase: Vec<String> = enabled_products_for_organization
        .iter()
        .map(|addr| format!("{:#x}", addr).to_lowercase())
        .filter(|p| enabled_products_for_project.iter().any(|proj_p| proj_p.to_lowercase() == *p))
        .collect();

    
    println!("Enabled products for organization: {:?}", enabled_products_for_organization);
    println!("Enabled products for project: {:?}", enabled_products_for_project);
    println!("Filtered enabled products: {:?}", enabled_products);

    
    let final_enabled_products = if enabled_products.is_empty() && !enabled_products_lowercase.is_empty() {
        println!("Using lowercase address matching");
        enabled_products_lowercase
    } else {
        enabled_products
    };

    println!("Final enabled products: {:?}", final_enabled_products);

    let model_info = models.iter().find(|m| m.name == model);

    let model_id = match model_info {
        Some(model) => model.id,
        None => return Err(ApiError::BadRequest("Invalid model".to_string())),
    };

    if !enabled_models.contains(&model_id) {
        return Err(ApiError::Forbidden);
    }

    if n > 5 {
        return Err(ApiError::BadRequest(
            "n must be less than or equal to 5".to_string(),
        ));
    }

    let llm = models::resolve_model(&model);

    let mut knowledges: Vec<Box<dyn Knowledge>> = vec![Box::new(StringKnowledge::new(
        "You are a helpful assistant. You answer questions by using provided knowledge, messages and prompts.",
    ))];

    let mut preamble = String::new();

    let mut total_cost = models
        .iter()
        .find(|m| m.name == model)
        .map_or(0, |m| m.price_per_call) as u64;

    
    if final_enabled_products.is_empty() {
        
    } else {
        for p in final_enabled_products {
        println!("Processing product with address: {}", p);
        
        let (uri, _encrypted_key, _price_per_call, category): (String, String, i64, String) =
            sqlx::query_as::<_, (String, String, i64, String)>("SELECT uri, encrypted_key, price_per_call, category FROM products WHERE address = ?")
                .bind(p)
                .fetch_one(&state.db)
                .await?;

        println!("Found product - URI: {}, Category: {}", uri, category);

        total_cost += _price_per_call as u64;

        
        if uri.is_empty() {
            return Err(ApiError::BadRequest("Product URI is empty".to_string()));
        }

        
        println!("Attempting to fetch URI: {}", uri);

        
        let uri_with_protocol = ensure_protocol(&uri);
        let parsed_uri = url::Url::parse(&uri_with_protocol)
            .map_err(|e| ApiError::BadRequest(format!("Invalid URI format: {} - URI: {}", e, uri)))?;

        let response = reqwest::get(parsed_uri)
            .await
            .map_err(|e| ApiError::BadRequest(format!("Failed to fetch product data: {} - URI: {}", e, uri)))?;
        
        let encrypted_data = response.bytes()
            .await
            .map_err(|e| ApiError::BadRequest(format!("Failed to read response bytes: {}", e)))?;
        let encrypted_bytes: Vec<u8> = encrypted_data.to_vec();

        let decrypted_data = decrypt(&encrypted_bytes, std::env::var("TEE_SECRET")?)?;

        if category.starts_with("knowledge") {
            if category == "knowledge:text" {
                knowledges.push(Box::new(StringKnowledge::new(String::from_utf8(
                    decrypted_data,
                )?)));
            } else if category == "knowledge:html" {
                let html = String::from_utf8(decrypted_data)?;
                let default_url = Url::parse("https://haithe.ai").unwrap();
                knowledges.push(Box::new(HtmlKnowledge::new(
                    Cursor::new(html),
                    default_url,
                    false,
                )));
            } else if category == "knowledge:pdf" {
                let pdf_content = String::from_utf8(decrypted_data)?;
                knowledges.push(Box::new(PdfFileKnowledge::new(pdf_content)));
            } else if category == "knowledge:url" {
                let url_string = String::from_utf8(decrypted_data)?;
                
                // Validate URL before making request
                if url_string.is_empty() {
                    return Err(ApiError::BadRequest("URL string is empty".to_string()));
                }
                
                let url_with_protocol = ensure_protocol(&url_string);
                let url = Url::parse(&url_with_protocol)
                    .map_err(|e| ApiError::BadRequest(format!("Invalid URL: {}", e)))?;
                
                let html = reqwest::get(&url_with_protocol)
                    .await
                    .map_err(|e| ApiError::BadRequest(format!("Failed to fetch URL content: {}", e)))?
                    .text()
                    .await
                    .map_err(|e| ApiError::BadRequest(format!("Failed to read URL response: {}", e)))?;
                    
                knowledges.push(Box::new(HtmlKnowledge::new(Cursor::new(html), url, false)));
            }
        } else if category == "promptset" {
            let prompts: Vec<String> = serde_json::from_slice(&decrypted_data)
                .map_err(|e| ApiError::BadRequest(format!("Failed to parse prompts: {}", e)))?;
            for prompt in prompts {
                preamble.push_str(&prompt);
                preamble.push('\n');
            }
        }
        }
    }

    let mut agent = Agent::new("Haithe Agent", llm).preamble(&preamble);
    agent.temperature = Some(temperature);
    agent.max_tokens = Some(1024);
    agent.knowledges = Arc::new(knowledges);

    let prompt = messages
        .iter()
        .filter_map(|msg| msg.get("content").and_then(|c| c.as_str()))
        .collect::<Vec<&str>>()
        .join("\n");

    let mut choices = Vec::new();

    for i in 0..n {
        let response = agent.prompt(&prompt).await?;

        choices.push(json!({
            "index": i,
            "message": {
                "role": "assistant",
                "content": response
            },
            "finish_reason": "stop"
        }));
    }

    Ok(HttpResponse::Ok().json(json!({
        "id": format!("chatcmpl-{}", uuid::Uuid::new_v4().to_string()),
        "object": "chat.completion",
        "created": chrono::Utc::now().timestamp(),
        "model": model,
        "choices": choices,
        "usage": {
            "total_cost": total_cost
        }
    })))
}

#[derive(Serialize, Deserialize, Debug, JsonSchema)]
pub struct RpcToolInput {
    pub url: String,
    pub method: String,                 // GET, POST, etc.
    pub param_position: Option<String>, // "query" or "body"
    pub params: Option<serde_json::Value>,          // dynamic JSON input
}

pub struct RpcTool;

#[async_trait]
impl StructureTool for RpcTool {
    type Input = RpcToolInput;
    type Output = serde_json::Value;

    fn name(&self) -> &str {
        "rpc"
    }

    fn description(&self) -> &str {
        "Send an HTTP request to a remote URL using GET/POST and return the response JSON"
    }

    async fn run_with_args<'a>(&'a self, input: Self::Input) -> Result<Self::Output, ToolError> {
        let client = reqwest::Client::new();

        let method = input.method.to_uppercase();
        let param_pos = input.param_position.unwrap_or_else(|| "body".to_string());
        let params = input.params.unwrap_or(json!({}));

        let response = match method.as_str() {
            "GET" => {
                if param_pos == "query" {
                    client.get(&input.url).query(&params).send().await
                } else {
                    client.get(&input.url).send().await
                }
            }
            "POST" => {
                if param_pos == "query" {
                    client.post(&input.url).query(&params).send().await
                } else {
                    client.post(&input.url).json(&params).send().await
                }
            }
            _ => return Err(ToolError::Unknown("Unsupported HTTP method".to_string())),
        };

        let res = response.map_err(|e| ToolError::Unknown(format!("HTTP error: {e}")))?;
        let json = res
            .json::<serde_json::Value>()
            .await
            .map_err(|e| ToolError::Unknown(format!("Invalid JSON: {e}")))?;

        Ok(json)
    }
}

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(get_completions_handler);
}
