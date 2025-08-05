use crate::lib::{error::ApiError, extractors::ApiCaller, respond, state::AppState};
use actix_web::{HttpResponse, Responder, delete, get, patch, post, web};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[post("/{id}")]
pub async fn call_webhook_handler(
    api_caller: ApiCaller,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let conversations = sqlx::query_as::<_, Conversation>(
        "SELECT id, title, created_at, updated_at FROM conversations WHERE wallet_address = ?",
    )
    .bind(&api_caller.wallet_address)
    .fetch_all(&state.db)
    .await
    .map_err(|_| ApiError::Internal("DB error".into()))?;

    Ok(respond::ok(
        "conversations fetched",
        serde_json::json!(conversations),
    ))
}

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(call_webhook_handler);
}
