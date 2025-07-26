use crate::lib::extractors::ApiCaller;
use crate::lib::models;
use crate::lib::state::AppState;
use crate::lib::{error::ApiError, respond};
use actix_web::{Responder, get, web};
use serde_json::json;

#[get("")]
async fn get_models_handler(
    api_caller: ApiCaller,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let models = models::get_models();

    let enabled_model_ids = sqlx::query_scalar(
        r#"
        SELECT model_id FROM org_model_enrollments WHERE org_id = ?
        "#,
    )
    .bind(&api_caller.org_id)
    .fetch_all(&state.db)
    .await?;

    let model_names = models
        .iter()
        .filter(|m| enabled_model_ids.contains(&m.id))
        .map(|m| m.name.clone())
        .collect::<Vec<_>>();

    Ok(respond::ok(
        "API caller authentication successful",
        json!({
            "models": model_names,
            "organization": api_caller.org_id,
        }),
    ))
}

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(get_models_handler);
}
