use crate::lib::extractors::AuthUser;
use crate::lib::{error::ApiError, respond, state::AppState};
use actix_web::{get, patch, post, delete, web, Responder};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct Project {
    pub id: i64,          // INTEGER PRIMARY KEY
    pub org_id: i64,      // INTEGER
    pub name: String,
    pub created_at: String,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct ProjectMember {
    pub project_id: i64,
    pub wallet_address: String,
    pub role: String,
}

#[derive(Deserialize)]
struct CreateProjectQuery {
    org_id: i64,
    name: String,
}

#[derive(Deserialize)]
struct UpdateProjectQuery {
    name: String,
}

#[derive(Deserialize)]
struct AddMemberQuery {
    wallet_address: String,
    role: String,
}

#[derive(Deserialize)]
struct UpdateMemberQuery {
    wallet_address: String,
    role: String,
}

#[derive(Deserialize)]
struct RemoveMemberQuery {
    wallet_address: String,
}

async fn can_manage_org(
    user_wallet: &str,
    org_id: i64,
    db: &sqlx::SqlitePool,
) -> Result<bool, sqlx::Error> {
    let owner_check = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM organizations WHERE id = ? AND owner = ?"
    )
    .bind(org_id)
    .bind(user_wallet)
    .fetch_one(db)
    .await?;

    if owner_check > 0 {
        return Ok(true);
    }

    let admin_check = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM org_members WHERE org_id = ? AND wallet_address = ? AND role = 'admin'"
    )
    .bind(org_id)
    .bind(user_wallet)
    .fetch_one(db)
    .await?;

    Ok(admin_check > 0)
}

async fn can_manage_project(
    user_wallet: &str,
    project_id: i64,
    db: &sqlx::SqlitePool,
) -> Result<bool, sqlx::Error> {
    // Get the org_id for this project
    let org_id: Option<i64> = sqlx::query_scalar(
        "SELECT org_id FROM projects WHERE id = ?"
    )
    .bind(project_id)
    .fetch_optional(db)
    .await?;

    let org_id = match org_id {
        Some(id) => id,
        None => return Ok(false),
    };

    // Check if user can manage the organization
    if can_manage_org(user_wallet, org_id, db).await? {
        return Ok(true);
    }

    // Check if user is a project admin
    let project_admin_check = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM project_members WHERE project_id = ? AND wallet_address = ? AND role = 'admin'"
    )
    .bind(project_id)
    .bind(user_wallet)
    .fetch_one(db)
    .await?;

    Ok(project_admin_check > 0)
}

#[post("")]
async fn create_project_handler(
    user: AuthUser,
    query: web::Query<CreateProjectQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {

    if !can_manage_org(&user.wallet_address, query.org_id, &state.db).await? {
        return Err(ApiError::Forbidden);
    }

    let org_exists = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM organizations WHERE id = ?"
    )
    .bind(query.org_id)
    .fetch_one(&state.db)
    .await?;

    if org_exists == 0 {
        return Err(ApiError::NotFound("Organization not found".to_string()));
    }

    let project = sqlx::query_as::<_, Project>(
        "INSERT INTO projects (org_id, name) VALUES (?, ?) RETURNING *"
    )
    .bind(query.org_id)
    .bind(&query.name)
    .fetch_one(&state.db)
    .await?;

    Ok(respond::ok("Project created", project))
}

#[get("/{id}")]
async fn get_project_handler(
    _: AuthUser,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = path.into_inner();

    let project = sqlx::query_as::<_, Project>(
        "SELECT id, org_id, name, created_at FROM projects WHERE id = ?"
    )
    .bind(project_id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| ApiError::NotFound("Project not found".to_string()))?;

    Ok(respond::ok("Project retrieved", project))
}

#[patch("/{id}")]
async fn update_project_handler(
    user: AuthUser,
    path: web::Path<i64>,
    query: web::Query<UpdateProjectQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = path.into_inner();

    if !can_manage_project(&user.wallet_address, project_id, &state.db).await? {
        return Err(ApiError::Forbidden);
    }

    let project = sqlx::query_as::<_, Project>(
        "UPDATE projects SET name = ? WHERE id = ? RETURNING id, org_id, name, created_at"
    )
    .bind(&query.name)
    .bind(project_id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| ApiError::NotFound("Project not found".to_string()))?;

    Ok(respond::ok("Project updated", project))
}

#[delete("/{id}")]
async fn delete_project_handler(
    user: AuthUser,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = path.into_inner();

    if !can_manage_project(&user.wallet_address, project_id, &state.db).await? {
        return Err(ApiError::Forbidden);
    }

    let project = sqlx::query_as::<_, Project>(
        "DELETE FROM projects WHERE id = ? RETURNING id, org_id, name, created_at"
    )
    .bind(project_id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| ApiError::NotFound("Project not found".to_string()))?;

    Ok(respond::ok("Project deleted", project))
}

#[get("/{id}/members")]
async fn get_project_members_handler(
    _: AuthUser,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = path.into_inner();

    // Check if project exists
    let project_exists = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM projects WHERE id = ?"
    )
    .bind(project_id)
    .fetch_one(&state.db)
    .await?;

    if project_exists == 0 {
        return Err(ApiError::NotFound("Project not found".to_string()));
    }

    let members = sqlx::query_as::<_, ProjectMember>(
        "SELECT project_id, wallet_address, role FROM project_members WHERE project_id = ? ORDER BY role DESC"
    )
    .bind(project_id)
    .fetch_all(&state.db)
    .await?;

    Ok(respond::ok("Project members retrieved", members))
}

#[post("/{id}/members")]
async fn add_project_member_handler(
    user: AuthUser,
    path: web::Path<i64>,
    query: web::Query<AddMemberQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = path.into_inner();
    let wallet_address = query.wallet_address.to_lowercase();


    // Check if project exists
    let project_exists = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM projects WHERE id = ?"
    )
    .bind(project_id)
    .fetch_one(&state.db)
    .await?;

    if project_exists == 0 {
        return Err(ApiError::NotFound("Project not found".to_string()));
    }

    // Check if user can manage this project
    if !can_manage_project(&user.wallet_address, project_id, &state.db).await? {
        return Err(ApiError::Forbidden);
    }

    if !matches!(query.role.as_str(), "admin" | "developer" | "viewer") {
        return Err(ApiError::BadRequest("Role must be 'admin', 'developer', or 'viewer'".to_string()));
    }

    let member = sqlx::query_as::<_, ProjectMember>(
        "INSERT INTO project_members (project_id, wallet_address, role) VALUES (?, ?, ?) RETURNING project_id, wallet_address, role"
    )
    .bind(project_id)
    .bind(&wallet_address)
    .bind(&query.role)
    .fetch_one(&state.db)
    .await?;

    Ok(respond::ok("Member added to project", member))
}

#[patch("/{id}/members")]
async fn update_project_member_handler(
    user: AuthUser,
    path: web::Path<i64>,
    query: web::Query<UpdateMemberQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = path.into_inner();
    let wallet_address = query.wallet_address.to_lowercase();

    if !can_manage_project(&user.wallet_address, project_id, &state.db).await? {
        return Err(ApiError::Forbidden);
    }

    if !matches!(query.role.as_str(), "admin" | "developer" | "viewer") {
        return Err(ApiError::BadRequest("Role must be 'admin', 'developer', or 'viewer'".to_string()));
    }

    let member = sqlx::query_as::<_, ProjectMember>(
        "UPDATE project_members SET role = ? WHERE project_id = ? AND wallet_address = ? RETURNING project_id, wallet_address, role"
    )
    .bind(&query.role)
    .bind(project_id)
    .bind(&wallet_address)
    .fetch_one(&state.db)
    .await
    .map_err(|_| ApiError::NotFound("Project member not found".to_string()))?;

    Ok(respond::ok("Member role updated", member))
}

#[delete("/{id}/members")]
async fn remove_project_member_handler(
    user: AuthUser,
    path: web::Path<i64>,
    query: web::Query<RemoveMemberQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = path.into_inner();
    let wallet_address = query.wallet_address.to_lowercase();

    if !can_manage_project(&user.wallet_address, project_id, &state.db).await? {
        return Err(ApiError::Forbidden);
    }

    let member = sqlx::query_as::<_, ProjectMember>(
        "DELETE FROM project_members WHERE project_id = ? AND wallet_address = ? RETURNING project_id, wallet_address, role"
    )
    .bind(project_id)
    .bind(&wallet_address)
    .fetch_one(&state.db)
    .await
    .map_err(|_| ApiError::NotFound("Project member not found".to_string()))?;

    Ok(respond::ok("Member removed from project", member))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(create_project_handler)
        .service(get_project_handler)
        .service(update_project_handler)
        .service(delete_project_handler)
        .service(get_project_members_handler)
        .service(add_project_member_handler)
        .service(update_project_member_handler)
        .service(remove_project_member_handler);
}