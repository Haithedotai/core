use crate::lib::extractors::ApiCaller;
use crate::lib::{error::ApiError, respond};
use actix_web::{Responder, get, post};
use serde_json::json;

#[get("/completions")]
async fn get_completions_handler(api_caller: ApiCaller) -> Result<impl Responder, ApiError> {
    Ok(respond::ok(
        "API caller authentication successful",
        json!({
            "object": "chat.completions",
            "model": "your-org-model",
            "choices": []
        }),
    ))
}

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(get_completions_handler);
}
