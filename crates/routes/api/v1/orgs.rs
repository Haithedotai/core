use crate::lib::extractors::AuthUser;
use crate::lib::{error::ApiError, respond, state::AppState};
use crate::{bail_internal, utils};
use actix_web::{HttpRequest, Responder, get, patch, post, web};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct Organization {
    pub id: i64,
    pub name: String,
    pub owner: String
    pub created_at: String,
}

#[derive(Deserialize)]
struct PostOrgQuery {
    name: String,
}

#[post("")]
async fn post_index_handler(
    user: AuthUser,
    query: web::Query<PostOrgQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let org_name = query.name.clone();

    let org = sqlx::query_as::<_, Organization>(
        "INSERT INTO organizations (name, owner) VALUES (?, ?) RETURNING *",
    )
    .bind(&org_name)
    .bind(&user.wallet_address)
    .fetch_one(&state.db)
    .await?;

    Ok(respond::ok("Organization created", org))
}

#[get("/{id}")]
async fn get_org_handler(
    _: AuthUser,
    path: web::Path<usize>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let id = path.into_inner();
    if id <= 0 {
        return Err(ApiError::NotFound("Organization not found".to_string()));
    }

    let org = sqlx::query_as::<_, Organization>("SELECT * FROM organizations WHERE id = ?")
        .bind(id)
        .fetch_one(&state.db)
        .await?;

    Ok(respond::ok("Organization retrieved", org))
}

#[patch("/{id}")]
async fn patch_org_handler(
    user: AuthUser,
    path: web::Path<i64>,
    query: web::Query<PostOrgQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let id = path.into_inner();
    let org_name = query.name.clone();

    if id <= 0 {
        return Err(ApiError::NotFound("Organization not found".to_string()));
    }

    let org = sqlx::query_as::<_, Organization>(
        "UPDATE organizations SET name = ? WHERE id = ? AND owner = ? RETURNING *",
    )
    .bind(&org_name)
    .bind(id)
    .bind(&user.wallet_address)
    .fetch_one(&state.db)
    .await?;

    Ok(respond::ok("Organization updated", org))
}

#[delete("/{id}")]
async fn delete_org_handler(
    user: AuthUser,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let id = path.into_inner();

    let org = sqlx::query_as::<_, Organization>(
        "DELETE FROM organizations WHERE id = ? AND owner = ? RETURNING *",
    )
    .bind(id)
    .bind(&user.wallet_address)
    .fetch_one(&state.db)
    .await?;

    Ok(respond::ok("Organization deleted", org))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(post_index_handler)
        .service(get_org_handler)
        .service(patch_org_handler)
        .service(delete_org_handler);
}
