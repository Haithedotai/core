use alith::data::crypto::decrypt;
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
    dotenvy::dotenv().ok();

    let uri = "https://ipfs.io/ipfs/bafkreigod2i2gv6xnceyoidacxjsl2nqpq4ik5lq6cd73iu6hugcuq3j6m";
    let response = reqwest::get(uri).await?;
    let encrypted_data = response.bytes().await?;
    let encrypted_bytes: Vec<u8> = encrypted_data.to_vec();

    let decrypted_data = decrypt(&encrypted_bytes, std::env::var("TEE_SECRET")?)?;

    let decrypted_string = String::from_utf8(decrypted_data)?;
    println!("Decrypted data: {}", decrypted_string);

    Ok(())
}
