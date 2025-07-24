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
    abi: String,
    address: String,
}

#[derive(Deserialize)]
struct Contracts {
    haithe_orchestrator: ContractInfo,
    usdt: ContractInfo,
}

impl Contracts {
    fn get(&self, name: &str) -> Option<&ContractInfo> {
        match name {
            "haithe_orchestrator" => Some(&self.haithe_orchestrator),
            "usdt" => Some(&self.usdt),
            _ => None,
        }
    }
}

pub fn get_contract(
    name: &str,
    address: Option<&str>,
) -> Result<Contract<Provider<Http>>, Box<dyn std::error::Error>> {
    let file_content = fs::read_to_string("./contract.json")?;
    let contracts: Contracts = serde_json::from_str(&file_content)?;

    // Metis Hyperion RPC URL
    let provider = Provider::<Http>::try_from("hyperion-testnet.metisdevops.link")?;
    let provider = Arc::new(provider);

    let address: Address = match address {
        Some(addr_str) => addr_str.parse()?,
        None => contracts.get(name).unwrap().address.parse()?,
    };
    let abi: Abi = serde_json::from_str(&contracts.get(name).unwrap().abi)?;

    Ok(Contract::new(address, abi, provider.clone()))
}
