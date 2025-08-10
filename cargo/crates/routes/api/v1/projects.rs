use crate::lib::extractors::AuthUser;
use crate::lib::telegram::sync_bots;
use crate::lib::{error::ApiError, respond, state::AppState};
use actix_web::{Responder, delete, get, patch, post, put, web};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct Project {
    pub id: i64,
    pub org_id: i64,
    pub project_uid: String,
    pub name: String,
    pub created_at: String,
    pub search_enabled: bool,
    pub memory_enabled: bool,
    pub teloxide_token: Option<String>,
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
    name: Option<String>,
    search_enabled: Option<bool>,
    memory_enabled: Option<bool>,
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

#[derive(Deserialize)]
struct PutProjectTelegramBody {
    teloxide_token: Option<String>,
}

async fn can_manage_org(
    user_wallet: &str,
    org_id: i64,
    db: &sqlx::SqlitePool,
) -> Result<bool, sqlx::Error> {
    let owner_check = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM organizations WHERE id = ? AND owner = ?",
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
    let org_id: Option<i64> = sqlx::query_scalar("SELECT org_id FROM projects WHERE id = ?")
        .bind(project_id)
        .fetch_optional(db)
        .await?;

    let org_id = match org_id {
        Some(id) => id,
        None => return Ok(false),
    };

    if can_manage_org(user_wallet, org_id, db).await? {
        return Ok(true);
    }

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

    let org_exists =
        sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM organizations WHERE id = ?")
            .bind(&query.org_id)
            .fetch_one(&state.db)
            .await?;

    if org_exists == 0 {
        return Err(ApiError::NotFound("Organization not found".to_string()));
    }

    let project_uid = Uuid::new_v4().to_string().replace("-", "");

    let project = sqlx::query_as::<_, Project>(
        "INSERT INTO projects (org_id, name, project_uid) VALUES (?, ?, ?) RETURNING id, org_id, project_uid, name, created_at, search_enabled, memory_enabled",
    )
    .bind(&query.org_id)
    .bind(&query.name)
    .bind(&project_uid)
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
        "SELECT id, org_id, project_uid, name, created_at, search_enabled, memory_enabled, teloxide_token FROM projects WHERE id = ?"
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

    let mut updates = Vec::new();
    let mut params = Vec::new();

    if let Some(name) = &query.name {
        updates.push("name = ?");
        params.push(name.as_str());
    }

    if let Some(search_enabled) = query.search_enabled {
        updates.push("search_enabled = ?");
        params.push(if search_enabled { "1" } else { "0" });
    }

    if let Some(memory_enabled) = query.memory_enabled {
        updates.push("memory_enabled = ?");
        params.push(if memory_enabled { "1" } else { "0" });
    }

    if updates.is_empty() {
        return Err(ApiError::BadRequest(
            "No fields provided to update".to_string(),
        ));
    }

    let sql = format!(
        "UPDATE projects SET {} WHERE id = ? RETURNING *",
        updates.join(", ")
    );

    let mut query_builder = sqlx::query_as::<_, Project>(&sql);
    for param in params {
        query_builder = query_builder.bind(param);
    }
    query_builder = query_builder.bind(project_id);

    let project = query_builder
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
        "DELETE FROM projects WHERE id = ? RETURNING id, org_id, project_uid, name, created_at, search_enabled, memory_enabled, teloxide_token"
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

    let project_exists = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM projects WHERE id = ?")
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

    let project_exists = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM projects WHERE id = ?")
        .bind(project_id)
        .fetch_one(&state.db)
        .await?;

    if project_exists == 0 {
        return Err(ApiError::NotFound("Project not found".to_string()));
    }

    if !can_manage_project(&user.wallet_address, project_id, &state.db).await? {
        return Err(ApiError::Forbidden);
    }

    if !matches!(query.role.as_str(), "admin" | "developer" | "viewer") {
        return Err(ApiError::BadRequest(
            "Role must be 'admin', 'developer', or 'viewer'".to_string(),
        ));
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
        return Err(ApiError::BadRequest(
            "Role must be 'admin', 'developer', or 'viewer'".to_string(),
        ));
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

#[get("/{id}/products")]
async fn get_project_products_handler(
    _: AuthUser,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = path.into_inner();

    let product_ids = sqlx::query_scalar::<_, i64>(
        "SELECT product_id FROM project_products_enabled WHERE project_id = ?",
    )
    .bind(project_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| ApiError::Internal("Failed to fetch project products".into()))?;

    Ok(respond::ok(
        "Project products fetched successfully",
        serde_json::json!({ "product_ids": product_ids }),
    ))
}

#[get("/{id}/price-per-call")]
async fn get_project_price_per_call_handler(
    _: AuthUser,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = path.into_inner();

    let project_exists = sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM projects WHERE id = ?")
        .bind(project_id)
        .fetch_one(&state.db)
        .await?;

    if project_exists == 0 {
        return Err(ApiError::NotFound("Project not found".to_string()));
    }

    let total_price: Option<i64> = sqlx::query_scalar(
        "SELECT SUM(p.price_per_call) 
         FROM products p 
         INNER JOIN project_products_enabled ppe ON p.id = ppe.product_id 
         WHERE ppe.project_id = ?",
    )
    .bind(project_id)
    .fetch_one(&state.db)
    .await?;

    let total_price = total_price.unwrap_or(0);

    Ok(respond::ok(
        "Total price per call calculated",
        serde_json::json!({ "total_price_per_call": total_price }),
    ))
}

#[put("/{id}/telegram")]
async fn put_project_telegram_handler(
    user: AuthUser,
    path: web::Path<i64>,
    body: web::Json<PutProjectTelegramBody>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = path.into_inner();

    if !can_manage_project(&user.wallet_address, project_id, &state.db).await? {
        return Err(ApiError::Forbidden);
    }

    let token_opt = body
        .teloxide_token
        .as_ref()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty());

    sqlx::query("UPDATE projects SET teloxide_token = ? WHERE id = ?")
        .bind(token_opt)
        .bind(project_id)
        .execute(&state.db)
        .await?;

    if let Err(e) = sync_bots(state.clone()).await {
        eprintln!(
            "Failed to sync Telegram bots after project token update: {}",
            e
        );
    }

    Ok(respond::ok("Telegram token updated", serde_json::json!({})))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(create_project_handler)
        .service(get_project_handler)
        .service(update_project_handler)
        .service(delete_project_handler)
        .service(get_project_members_handler)
        .service(add_project_member_handler)
        .service(update_project_member_handler)
        .service(remove_project_member_handler)
        .service(get_project_products_handler)
        .service(get_project_price_per_call_handler)
        .service(put_project_telegram_handler);
}
