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
    pub owner: String,
    pub created_at: String,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct OrgMember {
    pub org_id: i64,
    pub wallet_address: String,
    pub role: String,
    pub created_at: String,
}

#[derive(Deserialize)]
struct PostMemberQuery {
    wallet_address: String,
    role: String,
}

#[derive(Deserialize)]
struct PatchMemberQuery {
    wallet_address: String,
    role: String,
}

#[derive(Deserialize)]
struct DeleteMemberQuery {
    wallet_address: String,
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

#[get("/{id}/members")]
async fn get_org_members_handler(
    _: AuthUser,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let org_id = path.into_inner();

    let members = sqlx::query_as::<_, OrgMember>(
        "SELECT org_id, wallet_address, role, created_at FROM org_members WHERE org_id = ? ORDER BY created_at DESC"
    )
    .bind(org_id)
    .fetch_all(&state.db)
    .await?;

    Ok(respond::ok("Organization members retrieved", members))
}

#[post("/{id}/members")]
async fn post_org_members_handler(
    user: AuthUser,
    path: web::Path<i64>,
    query: web::Query<PostMemberQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let org_id = path.into_inner();

    let owner_check = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM organizations WHERE id = ? AND owner = ?"
    )
    .bind(org_id)
    .bind(&user.wallet_address)
    .fetch_one(&state.db)
    .await?;

    let admin_check = if owner_check == 0 {
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM org_members WHERE org_id = ? AND wallet_address = ? AND role = 'admin'"
        )
        .bind(org_id)
        .bind(&user.wallet_address)
        .fetch_one(&state.db)
        .await?
    } else {
        0
    };

    if owner_check == 0 && admin_check == 0 {
        return Err(ApiError::Forbidden("Only organization owners and admins can add members".to_string()));
    }

    if query.role != "admin" && query.role != "member" {
        return Err(ApiError::BadRequest("Role must be 'admin' or 'member'".to_string()));
    }

    let member = sqlx::query_as::<_, OrgMember>(
        "INSERT INTO org_members (org_id, wallet_address, role) VALUES (?, ?, ?) RETURNING org_id, wallet_address, role, created_at"
    )
    .bind(org_id)
    .bind(&query.wallet_address)
    .bind(&query.role)
    .fetch_one(&state.db)
    .await?;

    Ok(respond::ok("Member added to organization", member))
}

#[patch("/{id}/members")]
async fn patch_org_members_handler(
    user: AuthUser,
    path: web::Path<i64>,
    query: web::Query<PatchMemberQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let org_id = path.into_inner();

    let owner_check = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM organizations WHERE id = ? AND owner = ?"
    )
    .bind(org_id)
    .bind(&user.wallet_address)
    .fetch_one(&state.db)
    .await?;

    let admin_check = if owner_check == 0 {
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM org_members WHERE org_id = ? AND wallet_address = ? AND role = 'admin'"
        )
        .bind(org_id)
        .bind(&user.wallet_address)
        .fetch_one(&state.db)
        .await?
    } else {
        0
    };

    if owner_check == 0 && admin_check == 0 {
        return Err(ApiError::Forbidden("Only organization owners and admins can remove members".to_string()));
    }

    
    let member = sqlx::query_as::<_, OrgMember>(
        "UPDATE org_members SET role = ? WHERE org_id = ? AND wallet_address = ? RETURNING org_id, wallet_address, role, created_at"
    )
    .bind(&query.role)
    .bind(org_id)
    .bind(&query.wallet_address)
    .fetch_one(&state.db)
    .await?;

    Ok(respond::ok("Member role updated", member))
}

#[delete("/{id}/members")]
async fn delete_org_members_handler(
    user: AuthUser,
    path: web::Path<i64>,
    query: web::Query<DeleteMemberQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let org_id = path.into_inner();

    let owner_check = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM organizations WHERE id = ? AND owner = ?"
    )
    .bind(org_id)
    .bind(&user.wallet_address)
    .fetch_one(&state.db)
    .await?;

    let admin_check = if owner_check == 0 {
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM org_members WHERE org_id = ? AND wallet_address = ? AND role = 'admin'"
        )
        .bind(org_id)
        .bind(&user.wallet_address)
        .fetch_one(&state.db)
        .await?
    } else {
        0
    };

    if owner_check == 0 && admin_check == 0 {
        return Err(ApiError::Forbidden("Only organization owners and admins can remove members".to_string()));
    }

    let member = sqlx::query_as::<_, OrgMember>(
        "DELETE FROM org_members WHERE org_id = ? AND wallet_address = ? RETURNING org_id, wallet_address, role, created_at"
    )
    .bind(org_id)
    .bind(&query.wallet_address)
    .fetch_one(&state.db)
    .await?;

    Ok(respond::ok("Member removed from organization", member))
}


pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(post_index_handler)
        .service(get_org_handler)
        .service(patch_org_handler)
        .service(delete_org_handler)
        .service(get_org_members_handler)
        .service(post_org_members_handler)
        .service(patch_org_members_handler)
        .service(delete_org_members_handler);
}
