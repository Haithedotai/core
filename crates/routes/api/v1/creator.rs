use crate::lib::{contracts, error::ApiError, extractors::AuthUser, respond, state::AppState};
use actix_web::{Responder, get, post, web};
use ethers::abi::{Token, encode};
use ethers::providers::Middleware;
use ethers::types::{Address, H256};
use ethers::utils::{format_ether, keccak256, parse_ether};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Deserialize)]
pub struct PostBecomeCreatorRequest {
    pub uri: String,
    pub pub_key: String,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct CreatorDetails {
    pub wallet_address: String,
    pub uri: String,
    pub created_at: String,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct CreatorProduct {
    pub id: i64,
    pub address: String,
    pub creator: String,
    pub name: String,
    pub price_per_call: i64,
    pub category: String,
    pub created_at: String,
}

#[get("/{wallet_address}")]
async fn get_creator_by_address(
    path: web::Path<String>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let wallet_address = path.into_inner();

    let creator = sqlx::query_as::<_, CreatorDetails>(
        "SELECT wallet_address, uri, created_at FROM creators WHERE wallet_address = ?",
    )
    .bind(&wallet_address)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        println!("DB Error fetching creator: {:?}", e);
        ApiError::Internal("Failed to fetch creator details".into())
    })?;

    println!("Creator details: {:?}", creator);

    match creator {
        Some(creator) => Ok(respond::ok(
            "Creator details fetched successfully",
            serde_json::json!({ "creator": creator }),
        )),
        None => Err(ApiError::NotFound("Creator not found".into())),
    }
}

#[get("/{wallet_address}/products")]
async fn get_creator_products(
    path: web::Path<String>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let wallet_address = path.into_inner();

    let products = sqlx::query_as::<_, CreatorProduct>(
        "SELECT id, address, creator, name, price_per_call, category, created_at FROM products WHERE creator = ? ORDER BY created_at DESC"
    )
    .bind(&wallet_address)
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        println!("DB Error fetching creator products: {:?}", e);
        ApiError::Internal("Failed to fetch creator products".into())
    })?;

    Ok(respond::ok(
        "Creator products fetched successfully",
        serde_json::json!({ "products": products }),
    ))
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

    // Get server wallet address for logging
    let server_wallet_address = contract.client().default_sender().unwrap_or_default();
    println!("Server wallet address: {:?}", server_wallet_address);

    // Check server wallet balance (the one that pays for gas)
    let server_balance = contract
        .client()
        .get_balance(server_wallet_address, None)
        .await
        .map_err(|e| {
            println!("Failed to get server wallet balance: {:?}", e);
            ApiError::Internal("Failed to check server wallet balance".into())
        })?;

    let server_balance_in_ether = ethers::utils::format_ether(server_balance);
    println!(
        "Server wallet balance: {} wei ({} ETH)",
        server_balance, server_balance_in_ether
    );

    // Check if server has sufficient balance for gas fees
    let minimum_balance = ethers::utils::parse_ether("0.001").unwrap();
    if server_balance < minimum_balance {
        return Err(ApiError::Internal(
            format!("Server wallet has insufficient balance for transaction. Current: {} ETH, Required: at least 0.001 ETH", server_balance_in_ether).into(),
        ));
    }

    // Check user wallet balance (for informational purposes)
    let wallet_balance = contract
        .client()
        .get_balance(wallet_address, None)
        .await
        .map_err(|e| {
            println!("Failed to get user wallet balance: {:?}", e);
            ApiError::Internal("Failed to check user wallet balance".into())
        })?;

    // Convert balance from wei to ether for better readability
    let balance_in_ether = ethers::utils::format_ether(wallet_balance);
    println!(
        "User wallet balance: {} wei ({} ETH)",
        wallet_balance, balance_in_ether
    );

    // Note: User wallet balance is just for logging - server wallet pays for gas
    if wallet_balance.is_zero() {
        println!("Note: User wallet has zero balance, but server wallet will pay for gas fees");
    }

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
        .data(call_data)
        .gas(300_000u64); // Set a reasonable gas limit for the call

    let call_result = provider.call(&tx_request.into(), None).await.map_err(|e| {
        println!("Failed to call determineNextSeed: {:?}", e);
        ApiError::Internal("Failed to determine required private key seed".into())
    })?;

    let pvt_key_seed_bytes = H256::from_slice(&call_result);

    println!("Contract-determined pvt_key_seed: {:?}", pvt_key_seed_bytes);

    // Validate parameters before contract call
    if body.uri.is_empty() {
        return Err(ApiError::BadRequest("URI cannot be empty".into()));
    }

    if body.pub_key.is_empty() {
        return Err(ApiError::BadRequest("Public key cannot be empty".into()));
    }

    println!("Calling registerAsCreator with validated parameters");

    let call = contract
        .method::<_, ()>(
            "registerAsCreator",
            (
                wallet_address,
                body.uri.clone(),
                pvt_key_seed_bytes,
                body.pub_key.clone(),
            ),
        )
        .map_err(|e| {
            println!("Failed to create contract method call: {:?}", e);
            ApiError::Internal("Failed to create contract method call".into())
        })?;

    // Estimate gas for the transaction
    let gas_estimate = call.estimate_gas().await.map_err(|e| {
        println!("Failed to estimate gas: {:?}", e);
        // Try to provide more specific error information
        let error_msg = match e.to_string().contains("revert") {
            true => "Contract execution would revert. Check parameters and contract state.",
            false => "Failed to estimate gas for transaction",
        };
        ApiError::Internal(error_msg.into())
    })?;

    println!("Estimated gas: {:?}", gas_estimate);

    // Add a buffer to the gas estimate (50% extra for safety)
    let gas_limit = gas_estimate * 150 / 100;

    // Get current gas price
    let gas_price = contract.client().get_gas_price().await.map_err(|e| {
        println!("Failed to get gas price: {:?}", e);
        ApiError::Internal("Failed to get current gas price".into())
    })?;

    println!("Current gas price: {:?}", gas_price);
    println!("Using gas limit: {:?}", gas_limit);

    let call_with_gas = call.gas(gas_limit).gas_price(gas_price);
    let pending_tx = call_with_gas.send().await.map_err(|e| {
        println!("Failed to send transaction: {:?}", e);
        ApiError::Internal("Failed to send transaction".into())
    })?;

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
    cfg.service(get_creator_by_address)
        .service(get_creator_products)
        .service(become_creator);
}
