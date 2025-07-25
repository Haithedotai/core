use ethers::{
    abi::Abi,
    contract::Contract,
    middleware::SignerMiddleware,
    providers::{Http, Middleware, Provider},
    signers::{LocalWallet, Signer},
    types::Address,
};
use serde::Deserialize;
use std::{fs, sync::Arc};

#[derive(Deserialize)]
struct ContractInfo {
    abi: serde_json::Value,
    address: Option<String>,
}

#[derive(Deserialize)]
struct Contracts {
    HaitheOrchestrator: ContractInfo,
    tUSDT: ContractInfo,
    HaitheOrganization: ContractInfo,
}

impl Contracts {
    fn get(&self, name: &str) -> Option<&ContractInfo> {
        match name {
            "HaitheOrchestrator" => Some(&self.HaitheOrchestrator),
            "tUSDT" => Some(&self.tUSDT),
            "HaitheOrganization" => Some(&self.HaitheOrganization),
            _ => None,
        }
    }
}

pub fn get_contract(
    name: &str,
    address: Option<&str>,
) -> Result<Contract<Provider<Http>>, Box<dyn std::error::Error>> {
    let file_content = fs::read_to_string("./definitions.json")?;
    let contracts: Contracts = serde_json::from_str(&file_content)?;

    let rpc_url = std::env::var("BLOCKCHAIN_PROVIDER_URL")
        .unwrap_or_else(|_| "https://hyperion-testnet.metisdevops.link".to_string());
    let provider = Provider::<Http>::try_from(rpc_url.as_str())?;
    let provider = Arc::new(provider);

    let address: Address = match address {
        Some(addr_str) => addr_str.parse()?,
        None => {
            let contract_info = contracts.get(name).unwrap();
            let addr = contract_info
                .address
                .as_ref()
                .ok_or("Contract address not found in definitions")?;
            addr.parse()?
        }
    };
    let abi: Abi = serde_json::from_value(contracts.get(name).unwrap().abi.clone())?;

    println!("Creating contract {} at address {}", name, address);
    Ok(Contract::new(address, abi, provider.clone()))
}

pub async fn get_contract_with_wallet(
    name: &str,
    address: Option<&str>,
) -> Result<Contract<SignerMiddleware<Provider<Http>, LocalWallet>>, Box<dyn std::error::Error>> {
    let file_content = fs::read_to_string("./definitions.json")?;
    let contracts: Contracts = serde_json::from_str(&file_content)?;

    let rpc_url = std::env::var("BLOCKCHAIN_PROVIDER_URL")
        .unwrap_or_else(|_| "https://hyperion-testnet.metisdevops.link".to_string());
    let provider = Provider::<Http>::try_from(rpc_url.as_str())?;

    let private_key = std::env::var("SERVER_PVT_KEY")
        .map_err(|_| "PRIVATE_KEY environment variable not found")?;

    let wallet: LocalWallet = private_key
        .parse()
        .map_err(|_| "Invalid private key format")?;

    let chain_id = provider.get_chainid().await?;
    let wallet = wallet.with_chain_id(chain_id.as_u64());

    let signer_middleware = SignerMiddleware::new(provider, wallet);
    let signer_middleware = Arc::new(signer_middleware);

    let address: Address = match address {
        Some(addr_str) => addr_str.parse()?,
        None => {
            let contract_info = contracts.get(name).unwrap();
            let addr = contract_info
                .address
                .as_ref()
                .ok_or("Contract address not found in definitions")?;
            addr.parse()?
        }
    };
    let abi: Abi = serde_json::from_value(contracts.get(name).unwrap().abi.clone())?;

    println!(
        "Creating wallet-enabled contract {} at address {}",
        name, address
    );
    Ok(Contract::new(address, abi, signer_middleware))
}

pub enum ContractType {
    ReadOnly(Contract<Provider<Http>>),

    WithWallet(Contract<SignerMiddleware<Provider<Http>, LocalWallet>>),
}

pub async fn get_contract_auto(
    name: &str,
    address: Option<&str>,
) -> Result<ContractType, Box<dyn std::error::Error>> {
    match std::env::var("SERVER_PVT_KEY") {
        Ok(_) => {
            let contract = get_contract_with_wallet(name, address).await?;
            Ok(ContractType::WithWallet(contract))
        }
        Err(_) => {
            let contract = get_contract(name, address)?;
            Ok(ContractType::ReadOnly(contract))
        }
    }
}
