use crate::lib::extractors::ApiCaller;
use crate::lib::state::AppState;
use crate::lib::{contracts, error::ApiError, models, respond};
use actix_web::{HttpResponse, Responder, get, post, web};
use alith::data::crypto::decrypt;
use alith::{Agent, Chat, HtmlKnowledge, Knowledge, PdfFileKnowledge, StringKnowledge};
use chrono;
use serde::Deserialize;
use serde_json::json;
use std::io::Cursor;
use url::Url;
use uuid;

#[derive(Deserialize)]
pub struct GetChatCompletionsBody {
    pub model: String,
    pub messages: Vec<serde_json::Value>,
    pub n: Option<u32>,
    pub temperature: Option<f32>,
}

#[get("/completions")]
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
    let enabled_models = sqlx::query_scalar::<_, String>(
        "SELECT model_id FROM org_model_enrollments WHERE org_id = ?",
    )
    .bind(api_caller.org_id)
    .fetch_all(&state.db)
    .await?;

    let org_address: String = sqlx::query_scalar("SELECT address FROM organizations WHERE id = ?")
        .bind(api_caller.org_id)
        .fetch_one(&state.db)
        .await?;

    let enabled_products_for_organization: Vec<String> =
        contracts::get_contract("HaitheOrganization", Some(&org_address))?
            .method::<_, Vec<String>>("getEnabledProducts", ())?
            .call()
            .await?;

    let enabled_products_for_project: Vec<String> =
        sqlx::query_scalar::<_, String>("SELECT address FROM products WHERE project_id = ?")
            .bind(api_caller.project_id)
            .fetch_all(&state.db)
            .await?;

    let enabled_products: Vec<String> = enabled_products_for_organization
        .into_iter()
        .filter(|p| enabled_products_for_project.contains(p))
        .collect();

    let model_info = models.iter().find(|m| m.name == model);

    let model_id = match model_info {
        Some(model) => model.id.to_string(),
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

    for p in enabled_products {
        let (uri, _encrypted_key, _price_per_call, category): (String, String, i64, String) =
            sqlx::query_as::<_, (String, String, i64, String)>("SELECT uri, encrypted_key, price_per_call, category FROM products WHERE address = ?")
                .bind(p)
                .fetch_one(&state.db)
                .await?;

        total_cost += _price_per_call as u64;

        let response = reqwest::get(&uri).await?;
        let encrypted_data = response.bytes().await?;
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
                let url = Url::parse(&url_string)
                    .map_err(|e| ApiError::BadRequest(format!("Invalid URL: {}", e)))?;
                let html = reqwest::get(&url_string)
                    .await
                    .unwrap()
                    .text()
                    .await
                    .unwrap();
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

    let mut agent = Agent::new("Haithe Agent", llm).preamble(&preamble);
    agent.temperature = Some(temperature);
    agent.max_tokens = Some(1024);

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

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(get_completions_handler);
}
