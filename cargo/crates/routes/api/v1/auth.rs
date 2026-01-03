use crate::lib::extractors::AuthUser;
use crate::lib::{error::ApiError, respond, state::AppState};
use crate::{bail_internal, utils};
use actix_web::{HttpRequest, Responder, get, post, web};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Deserialize)]
struct GetNonceQuery {
    address: String,
}

#[get("/nonce")]
async fn get_nonce_handler(
    query: web::Query<GetNonceQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let address = query.address.to_lowercase();
    let nonce = Uuid::new_v4().to_string();

    let mut registry = state
        .nonce_registry
        .lock()
        .expect("Failed to lock nonce registry");
    registry.insert(address.clone(), nonce.clone());

    Ok(respond::ok(
        "Nonce generated",
        serde_json::json!({ "nonce": nonce }),
    ))
}

#[derive(Deserialize)]
struct PostLoginQuery {
    address: String,
    signature: String,
}

#[derive(Deserialize)]
struct WaitlistRequest {
    email: String,
}

#[post("/waitlist")]
async fn post_waitlist_handler(
    payload: web::Json<WaitlistRequest>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let email = payload.email.to_lowercase();

    // Basic email validation could go here, but keeping it minimal
    if email.is_empty() || !email.contains('@') {
        return Err(ApiError::BadRequest("Invalid email address".into()));
    }

    sqlx::query("INSERT INTO waitlist (email) VALUES (?)")
        .bind(&email)
        .execute(&state.db)
        .await
        .map_err(|e| {
            if let Some(db_err) = e.as_database_error() {
                if db_err.is_unique_violation() {
                    return ApiError::BadRequest("Email already registered".into());
                }
            }
            ApiError::BadRequest(e.to_string())
        })?;

    Ok(respond::ok("Signed up for waitlist", ()))
}

#[post("/login")]
async fn post_login_handler(
    req: HttpRequest,
    query: web::Query<PostLoginQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let address = query.address.to_lowercase();
    let signature = query.signature.clone();

    let message = {
        let registry = bail_internal!(state.nonce_registry.lock(), "Poisoned mutex");
        registry
            .get(&address)
            .cloned()
            .ok_or(ApiError::BadRequest("Nonce not found".into()))?
    };

    let valid = utils::verify_signature(&address, &signature, &message).unwrap_or(false);
    if !valid {
        return Err(ApiError::Unauthorized);
    }

    let conn_info = req.connection_info(); // Keep the temporary alive
    let ip = conn_info
        .realip_remote_addr()
        .unwrap_or("unknown")
        .to_string();

    let user_agent = req
        .headers()
        .get("User-Agent")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("unknown");

    let token = utils::generate_jwt(&address);

    sqlx::query("INSERT OR IGNORE INTO accounts (wallet_address) VALUES (?)")
        .bind(&address)
        .execute(&state.db)
        .await?;

    sqlx::query(
        r#"
        INSERT INTO sessions (wallet_address, token, ip, user_agent)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(wallet_address)
        DO UPDATE SET token = excluded.token, ip = excluded.ip, user_agent = excluded.user_agent, created_at = CURRENT_TIMESTAMP
        "#,
    )
    .bind(&address)
    .bind(&format!("Bearer {}", token))
    .bind(&ip)
    .bind(&user_agent)
    .execute(&state.db)
    .await?;

    Ok(respond::ok(
        "Login successful",
        serde_json::json!({
            "address": address,
            "token": token
        }),
    ))
}

#[post("/logout")]
async fn post_logout_handler(
    user: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    sqlx::query("DELETE FROM sessions WHERE wallet_address = ?")
        .bind(&user.wallet_address)
        .execute(&state.db)
        .await?;

    Ok(respond::ok("Logged out", ()))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_nonce_handler)
        .service(post_waitlist_handler)
        .service(post_login_handler)
        .service(post_logout_handler);
}
