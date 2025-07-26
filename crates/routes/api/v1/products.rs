use crate::lib::extractors::AuthUser;
use crate::lib::state;
use crate::lib::{contracts, error::ApiError, models::get_models, respond, state::AppState};
use actix_web::{Responder, delete, get, patch, post, web};
use serde::{Deserialize, Serialize, de};
use sqlx::{FromRow, query};
use uuid::Uuid;

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct Product {
    pub id: i64,
    pub orchestrator_idx: i64,
    pub creator: String,
    pub name: String,
    pub uri: String,
    pub encrypted_key: String,
    pub price_per_call: i64,
    pub created_at: String,
}

#[post("")]
async fn post_index_handler(
    _: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let highest_orchestrator_idx: i64 =
        sqlx::query_scalar("SELECT COALESCE(MAX(orchestrator_idx), 0) FROM products")
            .fetch_one(&state.db)
            .await?;
    let onchain_length: ethers::types::U256 = contracts::get_contract("HaitheOrchestrator", None)?
        .method::<_, ethers::types::U256>("productsCount", ())?
        .call()
        .await?;

    let mut synced_count: u32 = 0;

    // iterate from highest_orchestrator_idx + 1 to onchain_length
    for idx in (highest_orchestrator_idx + 1)..=onchain_length.as_u64() as i64 {
        // Convert to 0-based index for Solidity array access
        let solidity_idx = ethers::types::U256::from((idx - 1) as u64);
        let product_address: ethers::types::Address =
            contracts::get_contract("HaitheOrchestrator", None)?
                .method::<_, ethers::types::Address>("products", solidity_idx)?
                .call()
                .await?;

        let product_name: String =
            contracts::get_contract("HaitheProduct", Some(&format!("{:#x}", product_address)))?
                .method::<_, String>("name", ())?
                .call()
                .await?;

        let product_uri: String =
            contracts::get_contract("HaitheProduct", Some(&format!("{:#x}", product_address)))?
                .method::<_, String>("uri", ())?
                .call()
                .await?;

        let product_encrypted_key: String =
            contracts::get_contract("HaitheProduct", Some(&format!("{:#x}", product_address)))?
                .method::<_, String>("encryptedKeyForTEE", ())?
                .call()
                .await?;

        let product_creator: ethers::types::Address =
            contracts::get_contract("HaitheProduct", Some(&format!("{:#x}", product_address)))?
                .method::<_, ethers::types::Address>("creator", ())?
                .call()
                .await?;

        let product_category: String =
            contracts::get_contract("HaitheProduct", Some(&format!("{:#x}", product_address)))?
                .method::<_, String>("category", ())?
                .call()
                .await?;

        let product_price_per_call: ethers::types::U256 =
            contracts::get_contract("HaitheProduct", Some(&format!("{:#x}", product_address)))?
                .method::<_, ethers::types::U256>("pricePerCall", ())?
                .call()
                .await?;

        // Ensure creator exists in accounts table
        sqlx::query("INSERT OR IGNORE INTO accounts (wallet_address) VALUES (?);")
            .bind(&format!("{:#x}", product_creator))
            .execute(&state.db)
            .await?;

        let product = sqlx::query_as::<_, Product>(
            "INSERT INTO products (orchestrator_idx, creator, name, uri, encrypted_key, price_per_call, category) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *",
        )
        .bind(idx)
        .bind(&format!("{:#x}", product_creator))
        .bind(&product_name)
        .bind(&product_uri)
        .bind(&product_encrypted_key)
        .bind(product_price_per_call.as_u64() as i64)
        .bind(&product_category)
        .fetch_one(&state.db)
        .await?;
        synced_count += 1;
    }

    Ok(respond::ok(
        "Products synced successfully",
        serde_json::json!({ "count": synced_count }),
    ))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(post_index_handler);
}
