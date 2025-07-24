use ethers::{
    abi::Abi,
    contract::Contract,
    providers::{Http, Provider},
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

    // Get RPC URL from environment variable
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
