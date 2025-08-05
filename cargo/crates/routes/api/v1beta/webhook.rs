use crate::lib::{error::ApiError, extractors::ApiCaller, respond, state::AppState};
use actix_web::{HttpResponse, Responder, delete, get, patch, post, web};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[post("/{id}")]
pub async fn call_webhook_handler(
    api_caller: ApiCaller,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    Ok(respond::ok("fetched", serde_json::json!([])))
}

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(call_webhook_handler);
}
