use actix_web::{Responder, get, web};
use alith::tee::marlin::{AttestationRequest, MarlinClient};
use ethers::signers::LocalWallet;
use serde::Serialize;

use crate::lib::{error::ApiError, respond};

#[derive(Serialize)]
struct TeeInfo {
    tee_pubkey: String,
    attestation: String,
}

#[get("/attest")]
async fn get_attest_handler() -> Result<impl Responder, ApiError> {
    let client = MarlinClient::default();

    let attestation_hex = match client
        .attestation_hex(AttestationRequest {
            user_data: Some(uuid::Uuid::new_v4().as_bytes().to_vec()),
            ..Default::default()
        })
        .await
    {
        Ok(att_hex) => att_hex,
        Err(err) => {
            return Err(ApiError::Internal(format!(
                "Failed to get attestation: {}",
                err
            )));
        }
    };

    Ok(respond::ok(
        "Attestation fetched successfully",
        TeeInfo {
            tee_pubkey: String::from("unknown"),
            attestation: attestation_hex.clone(),
        },
    ))
}

#[get("/pub-key")]
async fn get_pub_key_handler() -> Result<impl Responder, ApiError> {
    let tee_pvt_key = std::env::var("MOCK_TEE_PVT_KEY").unwrap_or_default();

    let wallet: LocalWallet = tee_pvt_key
        .parse()
        .map_err(|e| ApiError::BadRequest(format!("Failed to parse wallet: {}", e)))?;
    let pubkey = wallet.signer().verifying_key().to_encoded_point(false);

    Ok(respond::ok(
        "TEE public key fetched successfully",
        serde_json::json!({
            "tee_pubkey": hex::encode(pubkey.as_bytes()),
        }),
    ))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_attest_handler).service(get_pub_key_handler);
}
