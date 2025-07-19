use crate::lib::extractors::AuthUser;
use crate::lib::{error::ApiError, respond, state::AppState};
use crate::{bail_internal, utils};
use actix_web::{HttpRequest, Responder, delete, get, patch, post, web};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct Organization {
    pub id: i64,
    pub name: String,
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

    let mut tx = state.db.begin().await?;
    let org = sqlx::query_as::<_, Organization>(
        "INSERT INTO organizations (name) VALUES (?) RETURNING *",
    )
    .bind(&org_name)
    .fetch_one(&mut *tx)
    .await?;

    sqlx::query("INSERT INTO org_owners (org_id, wallet_address) VALUES (?, ?)")
        .bind(org.id)
        .bind(user.wallet_address)
        .execute(&mut *tx)
        .await?;

    tx.commit().await?;

    Ok(respond::ok("Organization created", org))
}

#[get("/{id}")]
async fn get_org_handler(
    _: AuthUser,
    path: web::Path<i64>,
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

    let mut tx = state.db.begin().await?;
    let org = sqlx::query_as::<_, Organization>(
        "UPDATE organizations SET name = ? WHERE id = ? AND (
        EXISTS (SELECT 1 FROM org_owners WHERE org_id = ? AND wallet_address = ?) 
        OR
        EXISTS (SELECT 1 FROM org_admins WHERE org_id = ? AND wallet_address = ?)
        ) RETURNING *",
    )
    .bind(&org_name)
    .bind(id)
    .bind(id)
    .bind(user.wallet_address)
    .fetch_one(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok(respond::ok("Organization updated", org))
}

#[delete("/{id}")]
async fn delete_org_handler(
    user: AuthUser,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let id = path.into_inner();

    let mut tx = state.db.begin().await?;
    let org = sqlx::query_as::<_, Organization>(
        "DELETE FROM organizations WHERE id = ? AND (EXISTS (SELECT 1 FROM org_owners WHERE org_id = ? AND wallet_address = ?)) RETURNING *",
    )
    .bind(id)
    .bind(id)
    .bind(user.wallet_address)
    .fetch_one(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok(respond::ok("Organization deleted", org))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(post_index_handler)
        .service(get_org_handler)
        .service(patch_org_handler)
        .service(delete_org_handler);
}
