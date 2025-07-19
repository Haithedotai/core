use crate::lib::extractors::AuthUser;
use crate::lib::{error::ApiError, respond, state::AppState};
use crate::{bail_internal, utils};
use actix_web::{HttpRequest, Responder, get, post, web};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct Organization {
    pub id: i64,
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct Project {
    pub id: String,
    pub org_id: String,
    pub name: String,
    pub created_at: String,
}

#[get("")]
async fn get_index_handler(user: AuthUser) -> Result<impl Responder, ApiError> {
    Ok(respond::ok(
        "Account fetched",
        serde_json::json!({
            "address": user.wallet_address,
            "registered": user.created_at,
        }),
    ))
}

#[get("/orgs")]
async fn get_orgs_handler(
    user: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let orgs = sqlx::query_as::<_, Organization>(
        "SELECT * FROM organizations WHERE id IN (
            SELECT org_id FROM org_owners WHERE wallet_address = ? 
            UNION 
            SELECT org_id FROM org_admins WHERE wallet_address = ?
        )",
    )
    .bind(&user.wallet_address)
    .bind(&user.wallet_address)
    .fetch_all(&state.db)
    .await
    .map_err(|_| ApiError::Internal("DB error".into()))?;

    Ok(respond::ok("Organizations fetched", orgs))
}

#[get("/projects")]
async fn get_projects_handler(
    user: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let projects = sqlx::query_as::<_, Project>(
        "SELECT * FROM projects WHERE id IN (SELECT project_id FROM project_members WHERE wallet_address = ?)"
    )
    .bind(&user.wallet_address)
    .fetch_all(&state.db)
    .await
    .map_err(|_| ApiError::Internal("DB error".into()))?;

    Ok(respond::ok("Projects fetched", projects))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_index_handler)
        .service(get_orgs_handler)
        .service(get_projects_handler);
}
