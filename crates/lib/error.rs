use crate::lib::respond;
use actix_web::{HttpResponse, ResponseError};
use anyhow::Error as AnyError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Unauthorized")]
    Unauthorized,
    #[error("Forbidden")]
    Forbidden,
    #[error("Bad request: {0}")]
    BadRequest(String),
    #[error("Internal error: {0}")]
    Internal(String),
    #[error("Database error: {0}")]
    Sqlx(#[from] sqlx::Error),
    #[error("Task error: {0}")]
    Task(#[from] alith::TaskError),
}

impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        use ApiError::*;

        // Log the error
        println!("Error occurred: {}", self);

        let (msg, status) = match self {
            NotFound(m) => (m.as_str(), 404),
            Unauthorized => ("Unauthorized", 401),
            Forbidden => ("Forbidden", 403),
            BadRequest(m) => (m.as_str(), 400),
            Internal(m) => (m.as_str(), 500),
            Sqlx(_) => ("Database error", 500),
            Task(_) => ("Task execution error", 500),
        };
        respond::err(msg, status)
    }
}

impl From<AnyError> for ApiError {
    fn from(err: AnyError) -> Self {
        ApiError::Internal(format!("Unhandled error: {}", err))
    }
}

impl From<Box<dyn std::error::Error>> for ApiError {
    fn from(err: Box<dyn std::error::Error>) -> Self {
        ApiError::Internal(format!("Invalid Contract error: {}", err))
    }
}

impl<M> From<ethers::contract::ContractError<M>> for ApiError
where
    M: ethers::providers::Middleware,
{
    fn from(err: ethers::contract::ContractError<M>) -> Self {
        ApiError::Internal(format!("Contract error: {}", err))
    }
}

impl From<ethers::contract::AbiError> for ApiError {
    fn from(err: ethers::contract::AbiError) -> Self {
        ApiError::Internal(format!("Contract RPC error: {}", err))
    }
}

impl From<std::string::FromUtf8Error> for ApiError {
    fn from(err: std::string::FromUtf8Error) -> Self {
        ApiError::BadRequest(format!("Invalid UTF-8 data: {}", err))
    }
}

impl From<reqwest::Error> for ApiError {
    fn from(err: reqwest::Error) -> Self {
        ApiError::Internal(format!("HTTP request error: {}", err))
    }
}

impl From<std::env::VarError> for ApiError {
    fn from(err: std::env::VarError) -> Self {
        ApiError::Internal(format!("Environment variable error: {}", err))
    }
}

impl From<alith::lazai::ClientError> for ApiError {
    fn from(err: alith::lazai::ClientError) -> Self {
        ApiError::Internal(format!("Alith client error: {}", err))
    }
}

impl From<pkcs1::Error> for ApiError {
    fn from(err: pkcs1::Error) -> Self {
        ApiError::Internal(format!("PKCS1 error: {}", err))
    }
}

impl From<rsa::Error> for ApiError {
    fn from(err: rsa::Error) -> Self {
        ApiError::Internal(format!("RSA error: {}", err))
    }
}
