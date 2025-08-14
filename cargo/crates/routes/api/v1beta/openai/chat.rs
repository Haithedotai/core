use crate::lib::extractors::ApiCaller;
use crate::lib::state::AppState;
use crate::lib::{error::ApiError, llm};
use actix_web::{HttpResponse, Responder, post, web};
use alith::{StructureTool, ToolError};
use async_trait::async_trait;
use chrono;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid;

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

    let params = llm::LlmResponseParams {
        model: model.clone(),
        messages,
        temperature,
        n,
        org_uid: api_caller.org_uid,
        project_uid: api_caller.project_uid,
    };

    let response = llm::generate_llm_response(params, &state).await?;

    
    let log_type = format!("api.call.{}", model);
    let log_details = crate::utils::LogDetails {
        org_id: Some(org_id),
        project_id: Some(project_id),
        user_wallet: Some(api_caller.wallet_address.clone()),
        metadata: Some(serde_json::json!({
            "model": model,
            "cost": total_cost,
            "message_count": messages.len()
        }).to_string()),
    };
    crate::utils::log_event(&state.db, &log_type, log_details).await;

    Ok(HttpResponse::Ok().json(json!({
        "id": format!("chatcmpl-{}", uuid::Uuid::new_v4().to_string()),
        "object": "chat.completion",
        "created": chrono::Utc::now().timestamp(),
        "model": model,
        "choices": response.choices,
        "usage": {
            "total_cost": response.total_cost,
            "expense_till_now": response.current_expenditure,
            "prompt_tokens": response.prompt_tokens,
        }
    })))
}

#[derive(Serialize, Deserialize, Debug, JsonSchema)]
pub struct RpcToolInput {
    pub url: String,
    pub method: String,
    pub param_position: Option<String>,
    pub params: Option<serde_json::Value>,
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
