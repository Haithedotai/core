use crate::lib::{contracts, error::ApiError, extractors::AuthUser, respond, state::AppState};
use actix_web::{Responder, post, web};
use ethers::abi::{Token, encode};
use ethers::providers::Middleware;
use ethers::types::{Address, Bytes, H256};
use ethers::utils::keccak256;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct PostBecomeCreatorRequest {
    pub uri: String,
    pub pub_key: String,
}

#[post("")]
async fn become_creator(
    user: AuthUser,
    state: web::Data<AppState>,
    body: web::Json<PostBecomeCreatorRequest>,
) -> Result<impl Responder, ApiError> {
    let wallet_address: Address = user
        .wallet_address
        .parse()
        .map_err(|_| ApiError::BadRequest("Invalid wallet address format".into()))?;

    println!(
        "Registering creator with params: address={}, uri={}, pub_key={}",
        wallet_address, body.uri, body.pub_key
    );

    let contract = contracts::get_contract_with_wallet("HaitheOrchestrator", None).await?;

    let creator_identity_address: Address = contract
        .method::<_, Address>("creatorIdentity", ())?
        .call()
        .await
        .map_err(|e| {
            println!("Failed to get creator identity address: {:?}", e);
            ApiError::Internal("Failed to get creator identity contract".into())
        })?;

    println!(
        "Creator identity contract address: {:?}",
        creator_identity_address
    );

    let function_signature = "determineNextSeed(address)";
    let selector = &keccak256(function_signature.as_bytes())[..4];

    let encoded_params = encode(&[Token::Address(wallet_address)]);

    let mut call_data = Vec::new();
    call_data.extend_from_slice(selector);
    call_data.extend_from_slice(&encoded_params);

    let provider = contract.client();
    let tx_request = ethers::types::TransactionRequest::new()
        .to(creator_identity_address)
        .data(call_data);

    let call_result = provider.call(&tx_request.into(), None).await.map_err(|e| {
        println!("Failed to call determineNextSeed: {:?}", e);
        ApiError::Internal("Failed to determine required private key seed".into())
    })?;

    let pvt_key_seed_bytes = H256::from_slice(&call_result);

    println!("Contract-determined pvt_key_seed: {:?}", pvt_key_seed_bytes);

    let call = contract.method::<_, ()>(
        "registerAsCreator",
        (
            wallet_address,
            body.uri.clone(),
            pvt_key_seed_bytes,
            body.pub_key.clone(),
        ),
    )?;

    let pending_tx = call.send().await?;
    let tx_hash = pending_tx.tx_hash();
    println!("Transaction sent: {:?}", tx_hash);

    let _receipt = pending_tx.await.map_err(|e| {
        println!("Transaction failed: {:?}", e);
        ApiError::Internal("Transaction failed to be mined".into())
    })?;
    println!("Transaction mined successfully");

    sqlx::query(
        "INSERT OR REPLACE INTO creators (wallet_address, uri, pvt_key_seed, pub_key, created_at) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
    )
    .bind(&user.wallet_address)
    .bind(&body.uri)
    .bind(format!("{:?}", pvt_key_seed_bytes))
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
            "pub_key": body.pub_key,
            "pvt_key_seed": format!("{:?}", pvt_key_seed_bytes)
        }),
    ))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(become_creator);
}
