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
}

#[derive(Debug, Serialize)]
struct StatsResponse {
    contracts: Vec<ContractStats>,
    server: ServerStats,
    #[serde(rename = "transactionCount")]
    transaction_count_contracts: u64,
    #[serde(rename = "transactionCountWithServer")]
    transaction_count_with_server: u64,
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

#[get("")]
async fn get_index_handler(state: web::Data<AppState>) -> Result<impl Responder, ApiError> {
    let mut response = StatsResponse {
        contracts: Vec::new(),
        server: ServerStats {
            address: "0xcd4E9682172f67f2eA8cf0a9eCF199F3b78e57aD".to_string(),
            transactions_count: 0,
        },
        transaction_count_contracts: 0,
        transaction_count_with_server: 0,
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

                response.contracts.push(ContractStats {
                    address: org.address,
                    contract_type: "haithe.user.organization".to_string(),
                    transactions_count,
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

                response.contracts.push(ContractStats {
                    address: product.address,
                    contract_type: "haithe.marketplace.product".to_string(),
                    transactions_count,
                });
            }
        }
        Err(e) => println!("Warning: Failed to fetch products: {}", e),
    }

    // Add creator identity NFT contract (from orchestrator)
    match contracts::get_contract("HaitheOrchestrator", None) {
        Ok(orchestrator_contract) => {
            // Get creator identity NFT address
            match orchestrator_contract.method::<_, ethers::types::Address>("creatorIdentity", ()) {
                Ok(call) => match call.call().await {
                    Ok(creator_identity_address) => {
                        let creator_identity_addr = format!("{:#x}", creator_identity_address);
                        println!(
                            "Processing creator identity NFT at address: {}",
                            creator_identity_addr
                        );

                        let transactions_count =
                            txn_count(&creator_identity_addr).await.unwrap_or(0);

                        response.contracts.push(ContractStats {
                            address: creator_identity_addr,
                            contract_type: "haithe.core.creator-nft".to_string(),
                            transactions_count,
                        });
                    }
                    Err(e) => println!("Warning: Failed to get creator identity address: {}", e),
                },
                Err(e) => println!(
                    "Warning: Failed to create creator identity method call: {}",
                    e
                ),
            }

            // Add orchestrator contract itself
            let orchestrator_address = format!("{:#x}", orchestrator_contract.address());
            println!(
                "Processing orchestrator at address: {}",
                orchestrator_address
            );

            let transactions_count = txn_count(&orchestrator_address).await.unwrap_or(0);

            response.contracts.push(ContractStats {
                address: orchestrator_address,
                contract_type: "haithe.core.orchestrator".to_string(),
                transactions_count,
            });
        }
        Err(e) => println!("Warning: Failed to get orchestrator contract: {}", e),
    }

    // Calculate transaction counts
    response.transaction_count_contracts = response
        .contracts
        .iter()
        .map(|c| c.transactions_count)
        .sum::<u64>();

    response.transaction_count_with_server =
        response.server.transactions_count + response.transaction_count_contracts;

    println!(
        "Final response: {} contracts, contracts transactions: {}, total with server: {}",
        response.contracts.len(),
        response.transaction_count_contracts,
        response.transaction_count_with_server
    );

    Ok(respond::ok("Statistics retrieved successfully", response))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_index_handler);
}
