use crate::lib::respond;
use actix_web::{HttpResponse, ResponseError};
use anyhow::Error as AnyError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("Not found")]
    NotFound,
    #[error("Unauthorized")]
    Unauthorized,
    #[error("Bad request: {0}")]
    BadRequest(String),
    #[error("Internal error: {0}")]
    Internal(String),
    #[error("Database error: {0}")]
    Sqlx(#[from] sqlx::Error),
}

impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        use ApiError::*;
        let (msg, status) = match self {
            NotFound => ("Not found", 404),
            Unauthorized => ("Unauthorized", 401),
            BadRequest(m) => (m.as_str(), 400),
            Internal(m) => (m.as_str(), 500),
            Sqlx(_) => ("Database error", 500),
        };
        respond::err(msg, status)
    }
}

impl From<AnyError> for ApiError {
    fn from(err: AnyError) -> Self {
        ApiError::Internal(format!("Unhandled error: {}", err))
    }
}
