use crate::lib::extractors::ApiCaller;
use crate::lib::state::AppState;
use crate::lib::{error::ApiError, models, respond};
use actix_web::{HttpResponse, Responder, get, post, web};
use alith::{Agent, Chat};
use serde::Deserialize;
use serde_json::json;

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
    let mut agent = Agent::new("Haithe Agent", llm).preamble(
        "You are a helpful assistant that answers questions by using provided knowledge, messages and prompts.",
    );
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
        "choices": choices
    })))
}

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(get_completions_handler);
}
