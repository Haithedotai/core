use crate::lib::extractors::ApiCaller;
use crate::lib::{error::ApiError, respond};
use actix_web::{post, get, Responder};
use serde_json::json;

#[get("/test")]
async fn test_api_caller(api_caller: ApiCaller) -> Result<impl Responder, ApiError> {
    Ok(respond::ok(
        "API caller authentication successful",
        json!({
            "wallet_address": api_caller.wallet_address,
            "org_id": api_caller.org_id,
            "project_id": api_caller.project_id,
            "message": "API key validation passed successfully"
        }),
    ))
}

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(test_api_caller);
}