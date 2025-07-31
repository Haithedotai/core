use crate::lib::extractors::ApiCaller;
use crate::lib::models;
use crate::lib::state::AppState;
use crate::lib::{error::ApiError, respond};
use actix_web::{HttpResponse, Responder, get, web};
use serde_json::json;

#[get("")]
async fn get_models_handler(api_caller: ApiCaller, state: web::Data<AppState>) -> impl Responder {
    let models = models::get_models();

    // Get org_id from org_uid
    let org_id: i64 =
        match sqlx::query_scalar("SELECT id FROM organizations WHERE organization_uid = ?")
            .bind(&api_caller.org_uid)
            .fetch_one(&state.db)
            .await
        {
            Ok(id) => id,
            Err(_) => {
                return HttpResponse::BadRequest().json(json!({"error": "Organization not found"}));
            }
        };

    let enabled_model_ids = sqlx::query_scalar(
        r#"
        SELECT model_id FROM org_model_enrollments WHERE org_id = ?
        "#,
    )
    .bind(org_id)
    .fetch_all(&state.db)
    .await
    .unwrap();

    let model_objects = models
        .iter()
        .filter(|m| enabled_model_ids.contains(&m.id))
        .map(|m| {
            json!({
                "id": m.name,
                "object": "model"
            })
        })
        .collect::<Vec<_>>();

    HttpResponse::Ok().json(json!({
        "object": "list",
        "data": model_objects,
    }))
}

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(get_models_handler);
}
