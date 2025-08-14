use crate::lib::{contracts, error::ApiError, models, state::AppState};
use alith::data::crypto::decrypt;
use alith::{
    Agent, Chat, HtmlKnowledge, Knowledge, PdfFileKnowledge, SearchTool, StringKnowledge,
    WindowBufferMemory,
};
use ethers::abi::Address;
use serde_json::{Value, json};
use std::io::Cursor;
use std::sync::Arc;
use url::Url;

fn ensure_protocol(url_str: &str) -> String {
    if url_str.starts_with("http://") || url_str.starts_with("https://") {
        url_str.to_string()
    } else {
        format!("https://{}", url_str)
    }
}

#[derive(Debug)]
pub struct LlmResponseParams {
    pub model: String,
    pub messages: Vec<Value>,
    pub temperature: f32,
    pub n: u32,
    pub org_uid: String,
    pub project_uid: String,
}

#[derive(Debug)]
pub struct LlmResponse {
    pub choices: Vec<Value>,
    pub total_cost: u64,
    pub current_expenditure: u64,
    pub prompt_tokens: u64,
}

pub async fn generate_llm_response(
    params: LlmResponseParams,
    state: &AppState,
) -> Result<LlmResponse, ApiError> {
    let models = models::get_models();

    let org_id: i64 = sqlx::query_scalar("SELECT id FROM organizations WHERE organization_uid = ?")
        .bind(&params.org_uid)
        .fetch_one(&state.db)
        .await?;

    let project_id: i64 = sqlx::query_scalar("SELECT id FROM projects WHERE project_uid = ?")
        .bind(&params.project_uid)
        .fetch_one(&state.db)
        .await?;

    let (search_enabled, memory_enabled): (bool, bool) = sqlx::query_as::<_, (bool, bool)>(
        "SELECT search_enabled, memory_enabled FROM projects WHERE id = ?",
    )
    .bind(project_id)
    .fetch_one(&state.db)
    .await?;

    let enabled_models: Vec<u64> =
        sqlx::query_scalar::<_, u64>("SELECT model_id FROM org_model_enrollments WHERE org_id = ?")
            .bind(org_id)
            .fetch_all(&state.db)
            .await?;

    let model_info = models.iter().find(|m| m.name == params.model);
    let model_id = match model_info {
        Some(model) => model.id,
        None => return Err(ApiError::BadRequest("Invalid model".to_string())),
    };

    if !enabled_models.contains(&model_id) {
        return Err(ApiError::Forbidden);
    }

    if params.n > 5 {
        return Err(ApiError::BadRequest(
            "n must be less than or equal to 5".to_string(),
        ));
    }

    let org_address: String = sqlx::query_scalar("SELECT address FROM organizations WHERE id = ?")
        .bind(org_id)
        .fetch_one(&state.db)
        .await?;

    let contract = contracts::get_contract("HaitheOrganization", Some(org_address.as_str()))
        .map_err(|e| ApiError::Internal(format!("Failed to get contract: {}", e)))?;

    let method_result = contract.method::<_, Vec<ethers::types::Address>>("getEnabledProducts", ());
    let method = match method_result {
        Ok(m) => m,
        Err(e) => {
            return Err(ApiError::Internal(format!(
                "Failed to create method call: {}",
                e
            )));
        }
    };

    let enabled_products_for_organization: Vec<ethers::types::Address> = method
        .call()
        .await
        .map_err(|e| ApiError::Internal(format!("Failed to call contract method: {}", e)))?;

    let enabled_products_for_project: Vec<String> = sqlx::query_scalar::<_, String>(
        "SELECT p.address FROM products p 
             JOIN project_products_enabled ppe ON p.id = ppe.product_id 
             WHERE ppe.project_id = ?",
    )
    .bind(project_id)
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
        .filter(|p| {
            enabled_products_for_project
                .iter()
                .any(|proj_p| proj_p.to_lowercase() == *p)
        })
        .collect();

    let final_enabled_products =
        if enabled_products.is_empty() && !enabled_products_lowercase.is_empty() {
            enabled_products_lowercase
        } else {
            enabled_products
        };

    let llm = models::resolve_model(&params.model);
    let mut knowledges: Vec<Box<dyn Knowledge>> = vec![Box::new(StringKnowledge::new(
        "You are an AI assistant integrated with the Haithe platform. You can use the attached knowledge to answer context aware questions when the user asks about them, else you can answer in general.",
    ))];

    let mut preamble = String::new();
    let mut total_cost = models
        .iter()
        .find(|m| m.name == params.model)
        .map_or(0, |m| m.price_per_call) as u64;

    let mut product_payments: Vec<(String, String, u64)> = Vec::new();

    for p in final_enabled_products {
        let (uri, _encrypted_key, _price_per_call, category, creator): (String, String, i64, String, String) =
            sqlx::query_as::<_, (String, String, i64, String, String)>("SELECT uri, encrypted_key, price_per_call, category, creator FROM products WHERE address = ?")
                .bind(&p)
                .fetch_one(&state.db)
                .await?;

        let product_cost = _price_per_call as u64;
        total_cost += product_cost;
        product_payments.push((p.clone(), creator, product_cost));

        if uri.is_empty() {
            return Err(ApiError::BadRequest("Product URI is empty".to_string()));
        }

        let uri_with_protocol = ensure_protocol(&uri);
        let parsed_uri = url::Url::parse(&uri_with_protocol).map_err(|e| {
            ApiError::BadRequest(format!("Invalid URI format: {} - URI: {}", e, uri))
        })?;

        let response = reqwest::get(parsed_uri).await.map_err(|e| {
            ApiError::BadRequest(format!(
                "Failed to fetch product data: {} - URI: {}",
                e, uri
            ))
        })?;

        let encrypted_data = response
            .bytes()
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

                if url_string.is_empty() {
                    return Err(ApiError::BadRequest("URL string is empty".to_string()));
                }

                let url_with_protocol = ensure_protocol(&url_string);
                let url = Url::parse(&url_with_protocol)
                    .map_err(|e| ApiError::BadRequest(format!("Invalid URL: {}", e)))?;

                let html = reqwest::get(&url_with_protocol)
                    .await
                    .map_err(|e| {
                        ApiError::BadRequest(format!("Failed to fetch URL content: {}", e))
                    })?
                    .text()
                    .await
                    .map_err(|e| {
                        ApiError::BadRequest(format!("Failed to read URL response: {}", e))
                    })?;

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

    for (_product_address, creator_address, cost) in product_payments {
        if cost > 0 {
            let formatted_organization_address: Address = org_address
                .parse()
                .map_err(|_| ApiError::BadRequest("Invalid organization address format".into()))?;

            let orchestrator_contract =
                contracts::get_contract_with_wallet("HaitheOrchestrator", None).await?;

            let creator_addr: Address = creator_address
                .parse()
                .map_err(|_| ApiError::BadRequest("Invalid creator address format".into()))?;

            let creator_id: u64 = orchestrator_contract
                .method::<_, u64>("creators", (creator_addr,))?
                .call()
                .await?;

            if creator_id == 0 {
                continue;
            }

            let contract_call = orchestrator_contract.method::<_, ()>(
                "collectPaymentForCall",
                (
                    formatted_organization_address,
                    creator_id,
                    formatted_organization_address,
                    cost,
                ),
            )?;

            let tx = contract_call.send().await?;
            let _receipt = tx
                .await
                .map_err(|e| ApiError::BadRequest(format!("Transaction failed: {}", e)))?;
        }
    }

    let llm_cost = models
        .iter()
        .find(|m| m.name == params.model)
        .map_or(0, |m| m.price_per_call) as u64;

    if llm_cost > 0 {
        let formatted_organization_address: Address = org_address
            .parse()
            .map_err(|_| ApiError::BadRequest("Invalid organization address format".into()))?;

        let orchestrator_contract =
            contracts::get_contract_with_wallet("HaitheOrchestrator", None).await?;

        let contract_call = orchestrator_contract.method::<_, ()>(
            "collectPaymentForLLMCall",
            (
                formatted_organization_address,
                formatted_organization_address,
                llm_cost,
            ),
        )?;

        let tx = contract_call.send().await?;
        let _receipt = tx
            .await
            .map_err(|e| ApiError::BadRequest(format!("Transaction failed: {}", e)))?;
    }

    let mut agent = Agent::new("Haithe Agent", llm).preamble(&preamble);
    agent.temperature = Some(params.temperature);
    agent.max_tokens = Some(1024);
    agent.knowledges = Arc::new(knowledges);

    if search_enabled {
        agent = agent.tool(SearchTool::default()).await;
    }

    if memory_enabled {
        {
            let mut memory_map = state.window_buffer_memory.lock().unwrap();
            if !memory_map.contains_key(&params.project_uid) {
                memory_map.insert(params.project_uid.clone(), WindowBufferMemory::new(30));
            }
        }
        agent = agent.memory(WindowBufferMemory::new(30));
    }

    let prompt = params
        .messages
        .iter()
        .filter_map(|msg| msg.get("content").and_then(|c| c.as_str()))
        .collect::<Vec<&str>>()
        .join("\n");

    let mut choices = Vec::new();

    for i in 0..params.n {
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

    let formatted_organization_address: Address = org_address
        .parse()
        .map_err(|_| ApiError::BadRequest("Invalid wallet address format".into()))?;

    let balance_contract = contracts::get_contract("tUSDT", None)
        .map_err(|e| ApiError::Internal(format!("Failed to get tUSDT contract: {}", e)))?;

    let balance_method_result =
        balance_contract.method::<_, u64>("balanceOf", (formatted_organization_address));
    let balance_method = match balance_method_result {
        Ok(m) => m,
        Err(e) => {
            return Err(ApiError::Internal(format!(
                "Failed to create balanceOf method: {}",
                e
            )));
        }
    };

    let balance = balance_method
        .call()
        .await
        .map_err(|e| ApiError::Internal(format!("Failed to call balanceOf: {}", e)))?;

    let current_expenditure: i64 =
        sqlx::query_scalar("SELECT expenditure FROM organizations WHERE id = ?")
            .bind(org_id)
            .fetch_one(&state.db)
            .await?;

    let current_expenditure_u64 = current_expenditure.max(0) as u64;

    if balance < total_cost {
        return Err(ApiError::BadRequest("Insufficient funds".to_string()));
    }

    sqlx::query("UPDATE organizations SET expenditure = expenditure + ? WHERE id = ?")
        .bind(total_cost as i64)
        .bind(org_id)
        .execute(&state.db)
        .await?;

    Ok(LlmResponse {
        choices,
        total_cost,
        current_expenditure: current_expenditure_u64,
        prompt_tokens: prompt.len() as u64,
    })
}
