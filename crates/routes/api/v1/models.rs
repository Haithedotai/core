use crate::lib::{error::ApiError, models::get_models, respond};
use actix_web::{Responder, get, web};

#[get("")]
async fn get_index_handler() -> Result<impl Responder, ApiError> {
    Ok(respond::ok(
        "Models fetched",
        serde_json::json!(get_models()),
    ))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_index_handler);
}
