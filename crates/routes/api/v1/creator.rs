use crate::lib::extractors::AuthUser;
use crate::lib::{error::ApiError, respond, state::AppState};
use actix_web::{post, web, Responder};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct PostBecomeCreatorRequest {
    pub uri: String,
    pub pvt_key_seed: String,
    pub pub_key: String,
}

#[post("")]
async fn become_creator(
    user: AuthUser,
    state: web::Data<AppState>,
    body: web::Json<PostBecomeCreatorRequest>,
) -> Result<impl Responder, ApiError> {
    sqlx::query(
        "INSERT OR REPLACE INTO creators (wallet_address, uri, pvt_key_seed, pub_key, created_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
    )
    .bind(&user.wallet_address)
    .bind(&body.uri)
    .bind(&body.pvt_key_seed)
    .bind(&body.pub_key)
    .execute(&state.db)
    .await
    .map_err(|e| {
        println!("DB Error creating creator: {:?}", e);
        ApiError::Internal("Failed to register creator".into())
    })?;

    Ok(respond::ok(
        "Creator registered successfully",
        serde_json::json!({
            "wallet_address": user.wallet_address,
            "uri": body.uri,
            "pub_key": body.pub_key
        }),
    ))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(become_creator);
}