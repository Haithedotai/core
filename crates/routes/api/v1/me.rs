use crate::lib::extractors::AuthUser;
use crate::lib::{error::ApiError, respond, state::AppState};
use actix_web::{Responder, get, post, web};
use serde::Serialize;
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct Organization {
    pub id: i64,
    pub organization_uid: String,
    pub name: String,
    pub owner: String,
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
        "SELECT * FROM organizations WHERE owner = ? 
         UNION 
         SELECT organizations.* FROM organizations 
         INNER JOIN org_members ON organizations.id = org_members.org_id 
         WHERE org_members.wallet_address = ?",
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

#[post("/api-key/disable")]
async fn disable_api_key_handler(
    user: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    sqlx::query("UPDATE accounts SET api_key_last_issued_at = NULL WHERE wallet_address = ?")
        .bind(&user.wallet_address)
        .execute(&state.db)
        .await
        .map_err(|_| ApiError::Internal("DB error".into()))?;

    Ok(respond::ok("API key disabled", ()))
}

#[get("/api-key")]
async fn get_api_key_handler(
    user: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let api_key_last_issued_at: Option<u64> =
        sqlx::query_scalar("SELECT api_key_last_issued_at FROM accounts WHERE wallet_address = ?")
            .bind(&user.wallet_address)
            .fetch_optional(&state.db)
            .await?;

    match api_key_last_issued_at {
        Some(ts) => {
            if ts > 0 {
                return Err(ApiError::BadRequest("API key already issued".into()));
            }
        }
        None => {}
    }

    let tee_private_key = std::env::var("MOCK_TEE_PVT_KEY")
        .map_err(|_| ApiError::Internal("TEE private key not configured".into()))?;

    let timestamp = chrono::Utc::now().timestamp();
    let address = user
        .wallet_address
        .strip_prefix("0x")
        .unwrap_or(&user.wallet_address);
    let nonce = Uuid::new_v4().to_string();

    let message = format!("{}.{}.{}", timestamp, address, nonce);

    let signed_message = crate::utils::sign_message(&tee_private_key, &message)
        .map_err(|_| ApiError::Internal("Failed to sign API key".into()))?;
    let signature = signed_message
        .strip_prefix("0x")
        .unwrap_or("");

    let api_key = format!("sk-{}.{}.{}", address, nonce, signature);

    sqlx::query(
        "UPDATE accounts SET api_key_last_issued_at = CURRENT_TIMESTAMP WHERE wallet_address = ?",
    )
    .bind(&user.wallet_address)
    .execute(&state.db)
    .await?;

    Ok(respond::ok(
        "API key generated",
        serde_json::json!({
            "api_key": api_key,
            "message": message,
            "issued_at": timestamp
        }),
    ))
}

#[get("/api-key/last-issued")]
async fn get_api_key_last_handler(
    user: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let api_key_last_issued_at: Option<u64> =
        sqlx::query_scalar("SELECT api_key_last_issued_at FROM accounts WHERE wallet_address = ?")
            .bind(&user.wallet_address)
            .fetch_optional(&state.db)
            .await?;

    Ok(respond::ok(
        "Last API key issued at",
        serde_json::json!({
            "issued_at": api_key_last_issued_at
        }),
    ))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_index_handler)
        .service(get_orgs_handler)
        .service(get_projects_handler)
        .service(get_api_key_handler)
        .service(disable_api_key_handler);
}
