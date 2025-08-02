use crate::lib::extractors::AuthUser;
use crate::lib::{contracts, error::ApiError, respond, state::AppState};
use actix_web::{Responder, delete, get, post, web};
use alith::data::crypto::{DecodeRsaPublicKey, Pkcs1v15Encrypt, RsaPublicKey};
use alith::lazai::{ProofRequest, U256};
use reqwest;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct Product {
    pub id: i64,
    pub address: String,
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

    let alith_client = alith::lazai::Client::new_testnet()?;

    // iterate from highest_orchestrator_idx + 1 to onchain_length
    for idx in (highest_orchestrator_idx + 1)..=onchain_length.as_u64() as i64 {
        println!("Syncing product with orchestrator index: {}", idx);
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

        sqlx::query_as::<_, Product>(
            "INSERT INTO products (address, orchestrator_idx, creator, name, uri, encrypted_key, price_per_call, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *",
        )
        .bind(&format!("{:#x}", product_address))
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

        // Try to handle alith client operations, but continue if they fail
        if let Err(e) = async {
            let tee_secret = std::env::var("TEE_SECRET")?;

            let mut file_id = alith_client
                .get_file_id_by_url(product_uri.as_str())
                .await?;
            if file_id.is_zero() {
                file_id = alith_client.add_file(product_uri.as_str()).await?;
            }

            alith_client.request_proof(file_id, U256::from(100)).await?;

            let job_id = alith_client
                .file_job_ids(file_id)
                .await?
                .last()
                .cloned()
                .unwrap();
            let job = alith_client.get_job(job_id).await?;
            let node_info = alith_client.get_node(job.nodeAddress).await?.unwrap();
            let node_url = node_info.url;
            let pub_key = node_info.publicKey;
            let pub_key = RsaPublicKey::from_pkcs1_pem(&pub_key)?;
            let mut rng = rand::thread_rng();
            let encryption_key =
                pub_key.encrypt(&mut rng, Pkcs1v15Encrypt, tee_secret.as_bytes())?;
            let encryption_key = hex::encode(encryption_key);
            let encryption_seed = "default_seed"; // You may want to generate this dynamically
            let _ = reqwest::Client::new()
                .post(format!("{node_url}/proof"))
                .json(
                    &ProofRequest::builder()
                        .job_id(job_id.to())
                        .file_id(file_id.to())
                        .file_url(product_uri.clone())
                        .encryption_key(encryption_key)
                        .encryption_seed(encryption_seed.to_string())
                        .build(),
                )
                .send()
                .await?;

            alith_client.request_reward(file_id, None).await?;

            Ok::<(), Box<dyn std::error::Error>>(())
        }
        .await
        {
            println!(
                "Warning: Failed to process alith operations for product {}: {}",
                product_name, e
            );
        }
    }

    Ok(respond::ok(
        "Products synced successfully",
        serde_json::json!({ "count": synced_count }),
    ))
}

#[derive(Deserialize)]
struct PostEnableQuery {
    project_id: i64,
}

#[post("/{id}/enable")]
async fn post_enable_handler(
    user: AuthUser,
    query: web::Query<PostEnableQuery>,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = query.project_id;
    let product_id = path.into_inner();

    // check permission
    let has_permission = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT EXISTS(
            SELECT 1
            FROM projects p
            JOIN organizations o ON p.org_id = o.id
            LEFT JOIN org_members om ON om.org_id = o.id AND om.wallet_address = ?
            LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.wallet_address = ?
            WHERE p.id = ?
              AND (
                    o.owner = ?
                 OR (om.role IN ('admin') AND om.wallet_address IS NOT NULL)
                 OR (pm.role IN ('admin', 'developer') AND pm.wallet_address IS NOT NULL)
              )
        ) as "exists!"
        "#,
    )
    .bind(&user.wallet_address)
    .bind(&user.wallet_address)
    .bind(project_id)
    .bind(&user.wallet_address)
    .fetch_one(&state.db)
    .await?;

    if has_permission == 0 {
        return Err(ApiError::BadRequest(
            "You do not have permission to enable this product for the project".to_string(),
        ));
    }

    sqlx::query("INSERT INTO project_products_enabled (project_id, product_id) VALUES (?, ?)")
        .bind(project_id)
        .bind(product_id)
        .execute(&state.db)
        .await?;

    Ok(respond::ok(
        "Products enabled successfully",
        serde_json::json!({}),
    ))
}

#[derive(Deserialize)]
struct PostDisableQuery {
    project_id: i64,
}

#[delete("/{id}/disable")]
async fn delete_disable_handler(
    user: AuthUser,
    query: web::Query<PostDisableQuery>,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = query.project_id;
    let product_id = path.into_inner();

    // check permission
    let has_permission = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT EXISTS(
            SELECT 1
            FROM projects p
            JOIN organizations o ON p.org_id = o.id
            LEFT JOIN org_members om ON om.org_id = o.id AND om.wallet_address = ?
            LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.wallet_address = ?
            WHERE p.id = ?
              AND (
                    o.owner = ?
                 OR (om.role IN ('admin') AND om.wallet_address IS NOT NULL)
                 OR (pm.role IN ('admin', 'developer') AND pm.wallet_address IS NOT NULL)
              )
        ) as "exists!"
        "#,
    )
    .bind(&user.wallet_address)
    .bind(&user.wallet_address)
    .bind(project_id)
    .bind(&user.wallet_address)
    .fetch_one(&state.db)
    .await?;

    if has_permission == 0 {
        return Err(ApiError::BadRequest(
            "You do not have permission to disable this product for the project".to_string(),
        ));
    }

    sqlx::query("DELETE FROM project_products_enabled WHERE project_id = ? AND product_id = ?")
        .bind(project_id)
        .bind(product_id)
        .execute(&state.db)
        .await?;

    Ok(respond::ok(
        "Product disabled successfully",
        serde_json::json!({}),
    ))
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct ProductSummary {
    pub id: i64,
    pub address: String,
    pub creator: String,
    pub name: String,
    pub price_per_call: i64,
    pub category: String,
    pub created_at: String,
}

#[get("")]
async fn get_all_products(state: web::Data<AppState>) -> Result<impl Responder, ApiError> {
    let products = sqlx::query_as::<_, ProductSummary>(
        "SELECT id, address, creator, name, price_per_call, category, created_at FROM products ORDER BY created_at DESC"
    )
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        ApiError::Internal("Failed to fetch products".into())
    })?;

    Ok(respond::ok(
        "Products fetched successfully",
        serde_json::json!({ "products": products }),
    ))
}

#[get("/{id}")]
async fn get_product_by_id(
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let product_id = path.into_inner();

    let product = sqlx::query_as::<_, ProductSummary>(
        "SELECT id, address, creator, name, price_per_call, category, created_at FROM products WHERE id = ?"
    )
    .bind(product_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        ApiError::Internal("Failed to fetch product".into())
    })?;

    match product {
        Some(product) => Ok(respond::ok(
            "Product fetched successfully",
            serde_json::json!({ "product": product }),
        )),
        None => Err(ApiError::NotFound("Product not found".into())),
    }
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_all_products)
        .service(get_product_by_id)
        .service(post_index_handler)
        .service(post_enable_handler)
        .service(delete_disable_handler);
}
