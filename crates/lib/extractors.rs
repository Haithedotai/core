use crate::lib::{error::ApiError, state::AppState};
use crate::utils;
use actix_web::{FromRequest, HttpRequest, web};
use futures_util::future::{Ready, ready};
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow)]
pub struct AuthUser {
    pub wallet_address: String,
    pub created_at: String,
}

impl FromRequest for AuthUser {
    type Error = ApiError;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _: &mut actix_web::dev::Payload) -> Self::Future {
        let auth_header = req
            .headers()
            .get("Authorization")
            .and_then(|v| v.to_str().ok());

        let Some(token_header) = auth_header else {
            return ready(Err(ApiError::Unauthorized));
        };

        let Some(claims) = utils::decode_auth_header(token_header) else {
            return ready(Err(ApiError::Unauthorized));
        };

        let Some(state) = req.app_data::<web::Data<AppState>>() else {
            return ready(Err(ApiError::Internal("Missing app state".into())));
        };

        let db = state.db.clone();
        let wallet_address = claims.sub.clone();
        let token_header = token_header.to_string(); // clone for async

        let result = futures_executor::block_on(async move {
            // Check that the token matches the one stored in DB
            let token_from_db: Option<String> =
                sqlx::query_scalar("SELECT token FROM sessions WHERE wallet_address = ?")
                    .bind(&wallet_address)
                    .fetch_optional(&db)
                    .await
                    .map_err(|_| ApiError::Internal("DB error".into()))?;

            match token_from_db {
                Some(token) if token == token_header => {
                    // Token matches, proceed
                    let user = sqlx::query_as::<_, AuthUser>(
                        "SELECT wallet_address, created_at FROM accounts WHERE wallet_address = ?",
                    )
                    .bind(&wallet_address)
                    .fetch_optional(&db)
                    .await
                    .map_err(|_| ApiError::Internal("DB error".into()))?;

                    user.ok_or(ApiError::Unauthorized)
                }
                _ => Err(ApiError::Unauthorized),
            }
        });

        ready(result)
    }
}
