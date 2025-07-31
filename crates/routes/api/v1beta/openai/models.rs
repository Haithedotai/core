use crate::lib::extractors::ApiCaller;
use crate::lib::models;
use crate::lib::state::AppState;
use crate::lib::{error::ApiError, respond};
use actix_web::{Responder, get, web, HttpResponse};
use serde_json::json;

#[get("")]
async fn get_models_handler(
    api_caller: ApiCaller,
    state: web::Data<AppState>,
) -> impl Responder {
    let models = models::get_models();

    let enabled_model_ids = sqlx::query_scalar(
        r#"
        SELECT model_id FROM org_model_enrollments WHERE org_id = ?
        "#,
    )
    .bind(&api_caller.org_id)
    .fetch_all(&state.db)
    .await.unwrap();

    let model_objects = models
        .iter()
        .filter(|m| enabled_model_ids.contains(&m.id))
        .map(|m| json!({
            "id": m.name,
            "object": "model"
        }))
        .collect::<Vec<_>>();

    HttpResponse::Ok().json(
        json!({
            "object": "list",
            "data": model_objects,
        }),
    )
}

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(get_models_handler);
}
