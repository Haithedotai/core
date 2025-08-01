use crate::lib::extractors::AuthUser;
use crate::lib::{contracts, error::ApiError, respond, state::AppState};
use actix_web::{Responder, get, post, web};
use ethers::types::U256;
use serde::{Deserialize, Serialize};
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

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct FaucetRequest {
    pub id: i64,
    pub wallet_address: String,
    pub requested_at: String,
}

#[derive(Debug, Deserialize)]
pub struct FaucetPostRequest {
    // No fields needed since faucet requests are no longer tied to products
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
    let api_key_last_issued_at: Option<i64> = sqlx::query_scalar(
        "SELECT unixepoch(api_key_last_issued_at) FROM accounts WHERE wallet_address = ?",
    )
    .bind(&user.wallet_address)
    .fetch_optional(&state.db)
    .await?;

    if let Some(ts) = api_key_last_issued_at {
        if ts > 0 {
            return Err(ApiError::BadRequest("API key already issued".into()));
        }
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
    let signature = signed_message.strip_prefix("0x").unwrap_or("");

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
    let api_key_last_issued_at: Option<i64> = sqlx::query_scalar(
        "SELECT unixepoch(api_key_last_issued_at) FROM accounts WHERE wallet_address = ?",
    )
    .bind(&user.wallet_address)
    .fetch_optional(&state.db)
    .await?;

    let issued_at = api_key_last_issued_at.unwrap_or(0);

    Ok(respond::ok(
        "Last API key issued at",
        serde_json::json!({
            "issued_at": issued_at
        }),
    ))
}

#[get("/faucet")]
async fn get_faucet_handler(
    user: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let last_request: Option<FaucetRequest> = sqlx::query_as::<_, FaucetRequest>(
        "SELECT * FROM faucet_requests WHERE wallet_address = ? ORDER BY requested_at DESC LIMIT 1",
    )
    .bind(&user.wallet_address)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| ApiError::Internal("DB error".into()))?;

    match last_request {
        Some(request) => Ok(respond::ok(
            "Last faucet request found",
            serde_json::json!({
                "last_request": {
                    "id": request.id,
                    "requested_at": request.requested_at
                }
            }),
        )),
        None => Ok(respond::ok(
            "No faucet requests found",
            serde_json::json!({
                "last_request": {
                    "id": 0,
                    "requested_at": ""
                }
            }),
        )),
    }
}

#[post("/faucet")]
async fn post_faucet_handler(
    user: AuthUser,
    request: web::Json<FaucetPostRequest>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let recent_request: Option<FaucetRequest> = sqlx::query_as::<_, FaucetRequest>(
        "SELECT * FROM faucet_requests WHERE wallet_address = ? AND requested_at > datetime('now', '-1 hour')",
    )
    .bind(&user.wallet_address)
    .fetch_optional(&state.db)
    .await
    .map_err(|_| ApiError::Internal("DB error".into()))?;

    if recent_request.is_some() {
        return Err(ApiError::BadRequest(
            "Faucet can only be used once per hour".into(),
        ));
    }

    let amount = U256::from(500) * U256::exp10(18);

    let contract = contracts::get_contract_with_wallet("tUSDT", None)
        .await
        .map_err(|e| ApiError::Internal(format!("Failed to get contract: {}", e)))?;

    let user_address: ethers::types::Address = user
        .wallet_address
        .parse()
        .map_err(|_| ApiError::BadRequest("Invalid wallet address".into()))?;

    let contract_call = contract
        .method::<_, bool>("transfer", (user_address, amount))
        .map_err(|e| ApiError::Internal(format!("Failed to prepare transfer: {}", e)))?;

    let pending_tx = contract_call
        .send()
        .await
        .map_err(|e| ApiError::Internal(format!("Failed to send transfer: {}", e)))?;

    let tx_hash = pending_tx.tx_hash();

    let _receipt = pending_tx
        .await
        .map_err(|e| ApiError::Internal(format!("Transfer failed: {}", e)))?;

    sqlx::query("INSERT INTO faucet_requests (wallet_address) VALUES (?)")
        .bind(&user.wallet_address)
        .execute(&state.db)
        .await
        .map_err(|_| ApiError::Internal("Failed to record faucet request".into()))?;

    Ok(respond::ok(
        "Faucet tokens sent successfully",
        serde_json::json!({
            "amount": "500",
            "token": "tUSDT",
            "transaction_hash": format!("{:?}", tx_hash),
            "recipient": user.wallet_address
        }),
    ))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_index_handler)
        .service(get_orgs_handler)
        .service(get_projects_handler)
        .service(get_api_key_handler)
        .service(disable_api_key_handler)
        .service(get_api_key_last_handler)
        .service(get_faucet_handler)
        .service(post_faucet_handler);
}
