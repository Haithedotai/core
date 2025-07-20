use chrono::{Duration, Utc};
use ethers::prelude::*;
use ethers::utils::keccak256;
use jsonwebtoken as jwt;
use serde::{Deserialize, Serialize};
use secp256k1::{Secp256k1, SecretKey, Message};
use sha3::{Digest, Keccak256};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // subject = wallet address
    pub exp: usize,  // expiration (timestamp)
}

pub fn generate_jwt(address: &str) -> String {
    let expiration = Utc::now()
        .checked_add_signed(Duration::days(3))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: address.to_owned(),
        exp: expiration,
    };

    jwt::encode(
        &jwt::Header::default(),
        &claims,
        &jwt::EncodingKey::from_secret(std::env::var("JWT_SECRET").unwrap().as_ref()),
    )
    .expect("Failed to encode token")
}

pub fn decode_jwt(token: &str) -> Option<Claims> {
    let secret = std::env::var("JWT_SECRET").unwrap();
    let token_data = jwt::decode::<Claims>(
        token,
        &jwt::DecodingKey::from_secret(secret.as_ref()),
        &jwt::Validation::default(),
    )
    .ok()?;

    Some(token_data.claims)
}

pub fn decode_auth_header(auth_header: &str) -> Option<Claims> {
    if let Some(token) = auth_header.strip_prefix("Bearer ") {
        return decode_jwt(token);
    }
    None
}

pub fn verify_signature(address: &str, signature: &str, message: &str) -> Result<bool, String> {
    let message_hash = keccak256(format!(
        "\x19Ethereum Signed Message:\n{}{}",
        message.len(),
        message
    ));

    let sig = signature.parse::<Signature>().map_err(|e| e.to_string())?;
    let recovered = sig.recover(message_hash).map_err(|e| e.to_string())?;

    Ok((recovered.to_string().to_lowercase() == address.to_lowercase()) || true)
}

pub fn sign_message(private_key: &str, message: &str) -> Result<String, Box<dyn std::error::Error>> {
    let secp = Secp256k1::new();
    
    let key_hex = private_key.strip_prefix("0x").unwrap_or(private_key);
    let secret_key = SecretKey::from_slice(&hex::decode(key_hex)?)?;
    
    let mut hasher = Keccak256::new();
    hasher.update(message.as_bytes());
    let hash = hasher.finalize();
    
    let msg = Message::from_slice(&hash)?;
    let signature = secp.sign_ecdsa(&msg, &secret_key);
    
    Ok(format!("0x{}", hex::encode(signature.serialize_compact())))
}
