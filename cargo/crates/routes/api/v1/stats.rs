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

#[derive(Debug, Deserialize)]
struct TransactionCounterResponse {
    #[serde(deserialize_with = "deserialize_string_to_u64")]
    transactions_count: Option<u64>,
}

fn deserialize_string_to_u64<'de, D>(deserializer: D) -> Result<Option<u64>, D::Error>
where
    D: serde::Deserializer<'de>,
{
    use serde::de::Error;
    let s: Option<String> = Option::deserialize(deserializer)?;
    match s {
        Some(s) => s.parse::<u64>().map(Some).map_err(D::Error::custom),
        None => Ok(None),
    }
}

#[derive(Debug, Deserialize)]
struct ContractInfoResponse {
    creation_transaction: Option<CreationTransaction>,
}

#[derive(Debug, Deserialize)]
struct CreationTransaction {
    block_number: Option<i64>,
}

#[derive(Debug, Deserialize)]
struct TransactionsResponse {
    items: Option<Vec<TransactionItem>>,
}

#[derive(Debug, Deserialize)]
struct TransactionItem {
    from: Option<String>,
}

#[derive(Debug, Clone, FromRow)]
pub struct Organization {
    pub id: i64,
    pub organization_uid: String,
    pub address: String,
    pub orchestrator_idx: i64,
    pub name: String,
    pub owner: String,
    pub created_at: String,
    pub expenditure: i64,
}

#[derive(Debug, Serialize)]
struct ContractStats {
    address: String,
    #[serde(rename = "type")]
    contract_type: String,
    #[serde(rename = "transactionsCount")]
    transactions_count: u64,
    #[serde(rename = "deployedAtBlock")]
    deployed_at_block: Option<i64>,
    interactors: Vec<String>,
    #[serde(rename = "interactorsCount")]
    interactors_count: usize,
}

#[derive(Debug, Serialize)]
struct StatsResponse {
    contracts: Vec<ContractStats>,
    server: ServerStats,
    #[serde(rename = "transactionCount")]
    transaction_count: u64,
}

#[derive(Debug, Serialize)]
struct ServerStats {
    address: String,
    #[serde(rename = "transactionsCount")]
    transactions_count: u64,
}

async fn txn_count(address: &str) -> Result<u64, Box<dyn std::error::Error>> {
    let url = format!(
        "https://hyperion-testnet-explorer-api.metisdevops.link/api/v2/addresses/{}/counters",
        address
    );

    println!(
        "Fetching transaction count for address: {} from URL: {}",
        address, url
    );

    let client = reqwest::Client::new();
    let res = client.get(&url).send().await?;

    println!("Response status: {}", res.status());

    let response_text = res.text().await?;
    println!("Response body: {}", response_text);

    let data: TransactionCounterResponse = serde_json::from_str(&response_text)?;

    Ok(data.transactions_count.unwrap_or(0))
}

async fn get_deployment_block(address: &str) -> Result<Option<i64>, Box<dyn std::error::Error>> {
    let url = format!(
        "https://hyperion-testnet-explorer-api.metisdevops.link/api/v2/contracts/{}",
        address
    );

    let client = reqwest::Client::new();
    let res = client.get(&url).send().await?;
    let data: ContractInfoResponse = res.json().await?;

    Ok(data.creation_transaction.and_then(|ct| ct.block_number))
}

async fn get_interactors(
    contract_address: &str,
) -> Result<Vec<String>, Box<dyn std::error::Error>> {
    let mut interactors = std::collections::HashSet::new();
    let mut page = 1;
    let limit = 50;

    loop {
        let url = format!(
            "https://hyperion-testnet-explorer-api.metisdevops.link/api/v2/addresses/{}/transactions?page={}&limit={}",
            contract_address, page, limit
        );

        let client = reqwest::Client::new();
        let res = client.get(&url).send().await?;
        let data: TransactionsResponse = res.json().await?;

        match data.items {
            Some(items) if !items.is_empty() => {
                for tx in items {
                    if let Some(from) = tx.from {
                        interactors.insert(from.to_lowercase());
                    }
                }
                page += 1;
            }
            _ => break,
        }
    }

    Ok(interactors.into_iter().collect())
}

#[get("")]
async fn get_index_handler(state: web::Data<AppState>) -> Result<impl Responder, ApiError> {
    let mut response = StatsResponse {
        contracts: Vec::new(),
        server: ServerStats {
            address: "0xcd4E9682172f67f2eA8cf0a9eCF199F3b78e57aD".to_string(),
            transactions_count: 0,
        },
        transaction_count: 0,
    };

    // Get server transaction count
    match txn_count("0xcd4E9682172f67f2eA8cf0a9eCF199F3b78e57aD").await {
        Ok(count) => {
            println!("Server transaction count: {}", count);
            response.server.transactions_count = count;
        }
        Err(e) => println!("Warning: Failed to get server transaction count: {}", e),
    }

    // Get organizations from database
    let orgs_query = "SELECT * FROM organizations";
    match sqlx::query_as::<_, Organization>(orgs_query)
        .fetch_all(&state.db)
        .await
    {
        Ok(organizations) => {
            println!("Found {} organizations", organizations.len());
            for org in organizations {
                println!(
                    "Processing organization: {} at address: {}",
                    org.name, org.address
                );
                let transactions_count = txn_count(&org.address).await.unwrap_or(0);
                let deployed_at_block = get_deployment_block(&org.address).await.unwrap_or(None);
                let interactors = get_interactors(&org.address).await.unwrap_or_default();

                response.contracts.push(ContractStats {
                    address: org.address,
                    contract_type: "haithe.user.organization".to_string(),
                    transactions_count,
                    deployed_at_block,
                    interactors_count: interactors.len(),
                    interactors,
                });
            }
        }
        Err(e) => println!("Warning: Failed to fetch organizations: {}", e),
    }

    // Get products from database
    let products_query = "SELECT * FROM products";
    match sqlx::query_as::<_, Product>(products_query)
        .fetch_all(&state.db)
        .await
    {
        Ok(products) => {
            println!("Found {} products", products.len());
            for product in products {
                println!(
                    "Processing product: {} at address: {}",
                    product.name, product.address
                );
                let transactions_count = txn_count(&product.address).await.unwrap_or(0);
                let deployed_at_block =
                    get_deployment_block(&product.address).await.unwrap_or(None);
                let interactors = get_interactors(&product.address).await.unwrap_or_default();

                response.contracts.push(ContractStats {
                    address: product.address,
                    contract_type: "haithe.marketplace.product".to_string(),
                    transactions_count,
                    deployed_at_block,
                    interactors_count: interactors.len(),
                    interactors,
                });
            }
        }
        Err(e) => println!("Warning: Failed to fetch products: {}", e),
    }

    // Calculate total transaction count
    response.transaction_count = response
        .contracts
        .iter()
        .map(|c| c.transactions_count)
        .sum();

    println!(
        "Final response: {} contracts, total transactions: {}",
        response.contracts.len(),
        response.transaction_count
    );

    Ok(respond::ok("Statistics retrieved successfully", response))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_index_handler);
}
