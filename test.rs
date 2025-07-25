use ethers::abi::Abi;
use ethers::prelude::*;
use ethers::providers::{Http, Provider};
use serde::Deserialize;
use std::{fs, sync::Arc};

#[derive(Deserialize)]
struct ContractInfo {
    abi: String,
    address: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Load ABI and address from JSON
    let file_content = fs::read_to_string("contract.json")?;
    let contract_info: ContractInfo = serde_json::from_str(&file_content)?;

    // Setup Ethereum mainnet provider
    let provider = Provider::<Http>::try_from("https://eth.rpc.blxrbdn.com")?;
    let provider = Arc::new(provider);

    // Parse address and ABI
    let address: Address = contract_info.address.parse()?;
    let abi: Abi = serde_json::from_str(&contract_info.abi)?;

    // Create dynamic contract instance
    let contract = Contract::new(address, abi, provider.clone());

    // Example call to name() function
    let name: String = contract.method::<_, String>("name", ())?.call().await?;
    println!("Contract name(): {}", name);

    Ok(())
}
