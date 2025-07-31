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

#[derive(Debug, Clone, FromRow)]
pub struct ApiCaller {
    pub wallet_address: String,
    pub org_uid: String,
    pub project_uid: String,
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
        let token_header = token_header.to_string();

        let result = futures_executor::block_on(async move {
            let token_from_db: Option<String> =
                sqlx::query_scalar("SELECT token FROM sessions WHERE wallet_address = ?")
                    .bind(&wallet_address)
                    .fetch_optional(&db)
                    .await
                    .map_err(|_| ApiError::Internal("DB error".into()))?;

            match token_from_db {
                Some(token) if token == token_header => {
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

impl FromRequest for ApiCaller {
    type Error = ApiError;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _: &mut actix_web::dev::Payload) -> Self::Future {
        let auth_header = req
            .headers()
            .get("Authorization")
            .and_then(|v| v.to_str().ok());

        let Some(auth_header) = auth_header else {
            return ready(Err(ApiError::Unauthorized));
        };

        let api_key = if let Some(key) = auth_header.strip_prefix("Bearer ") {
            key
        } else {
            return ready(Err(ApiError::Unauthorized));
        };

        let parsed_api_key = match utils::parse_api_key(api_key) {
            Ok(parsed) => parsed,
            Err(_) => {
                return ready(Err(ApiError::Unauthorized));
            }
        };

        let org_uid_header = match req
            .headers()
            .get("Haithe-Organization")
            .and_then(|v| v.to_str().ok())
            .map(|s| s.strip_prefix("org-").unwrap_or(s))
            .or_else(|| {
                req.headers()
                    .get("OpenAI-Organization")
                    .and_then(|v| v.to_str().ok())
                    .map(|s| s.strip_prefix("org-").unwrap_or(s))
            }) {
            Some(org_uid) => org_uid.to_string(),
            None => {
                return ready(Err(ApiError::BadRequest(
                    "Missing or invalid Organization header".into(),
                )));
            }
        };

        let proj_uid_header = match req
            .headers()
            .get("Haithe-Project")
            .and_then(|v| v.to_str().ok())
            .map(|s| s.strip_prefix("proj-").unwrap_or(s))
            .or_else(|| {
                req.headers()
                    .get("OpenAI-Project")
                    .and_then(|v| v.to_str().ok())
                    .map(|s| s.strip_prefix("proj-").unwrap_or(s))
            }) {
            Some(proj_uid) => proj_uid.to_string(),
            None => {
                return ready(Err(ApiError::BadRequest(
                    "Missing or invalid Project header".into(),
                )));
            }
        };

        let Some(state) = req.app_data::<web::Data<AppState>>() else {
            return ready(Err(ApiError::Internal("Missing app state".into())));
        };

        let db = state.db.clone();
        let wallet_address = parsed_api_key.address.clone();
        let api_key = api_key.to_string();

        let result = futures_executor::block_on(async move {
            println!("Debug: wallet_address = {}", wallet_address);
            println!("Debug: org_uid = {}", org_uid_header);
            println!("Debug: project_uid = {}", proj_uid_header);
            println!("Debug: signature = {}", parsed_api_key.signature);

            let api_key_timestamp: Option<String> = sqlx
                ::query_scalar(
                    "SELECT strftime('%s', api_key_last_issued_at) FROM accounts WHERE wallet_address = ?"
                )
                .bind(&wallet_address)
                .fetch_optional(&db).await
                .map_err(|e| {
                    println!("DB Error 1 - API key timestamp query: {:?}", e);
                    ApiError::Internal("Failed to fetch API key timestamp".into())
                })?;

            let timestamp = match api_key_timestamp {
                Some(ts_str) => {
                    let ts = ts_str.parse::<i64>().map_err(|e| {
                        println!("Debug: Failed to parse timestamp '{}': {:?}", ts_str, e);
                        ApiError::Internal("Invalid timestamp format".into())
                    })?;
                    println!("Debug: Found timestamp = {}", ts);
                    ts
                }
                None => {
                    println!(
                        "Debug: No API key timestamp found for address: {}",
                        wallet_address
                    );
                    return Err(ApiError::Unauthorized);
                }
            };

            let private_key = std::env::var("MOCK_TEE_PVT_KEY")
                .map_err(|_| ApiError::Internal("TEE private key not configured".into()))?;

            let public_key = utils::derive_public_key_from_private(&private_key)
                .map_err(|_| ApiError::Internal("Failed to derive public key".into()))?;

            let is_valid = utils::verify_api_key(&public_key, &api_key, timestamp)
                .map_err(|_| ApiError::Internal("Failed to verify API key".into()))?;

            if !is_valid {
                println!("Debug: API key signature invalid");
                return Err(ApiError::Unauthorized);
            }

            let org_role: Option<String> = sqlx
                ::query_scalar(
                    "SELECT CASE 
                    WHEN organizations.owner = ? THEN 'owner'
                    ELSE org_members.role
                 END as role
                 FROM organizations 
                 LEFT JOIN org_members ON organizations.id = org_members.org_id AND org_members.wallet_address = ?
                 WHERE organizations.organization_uid = ? 
                 AND (organizations.owner = ? OR org_members.wallet_address = ?)"
                )
                .bind(&wallet_address)
                .bind(&wallet_address)
                .bind(&org_uid_header)
                .bind(&wallet_address)
                .bind(&wallet_address)
                .fetch_optional(&db).await
                .map_err(|e| {
                    println!("DB Error 2 - Organization role query: {:?}", e);
                    ApiError::Internal("Failed to fetch organization role".into())
                })?;

            println!("Debug: org_role = {:?}", org_role);

            let project_role: Option<String> = sqlx::query_scalar(
                "SELECT pm.role 
                     FROM project_members pm
                     JOIN projects p ON pm.project_id = p.id
                     WHERE pm.wallet_address = ? AND p.project_uid = ?",
            )
            .bind(&wallet_address)
            .bind(&proj_uid_header)
            .fetch_optional(&db)
            .await
            .map_err(|e| {
                println!("DB Error 3 - Project role query: {:?}", e);
                ApiError::Internal("Failed to fetch project role".into())
            })?;

            println!("Debug: project_role = {:?}", project_role);

            let has_org_permission = match org_role.as_ref().map(|s| s.as_str()) {
                Some("owner") | Some("admin") => true,
                _ => false,
            };

            let has_project_permission = match project_role.as_ref().map(|s| s.as_str()) {
                Some("admin") | Some("developer") => true,
                _ => false,
            };

            println!(
                "Debug: has_org_permission = {}, has_project_permission = {}",
                has_org_permission, has_project_permission
            );

            if !has_org_permission && !has_project_permission {
                return Err(ApiError::Forbidden);
            }

            let project_exists: Option<bool> = sqlx::query_scalar(
                "SELECT 1 
                     FROM projects p
                     JOIN organizations o ON p.org_id = o.id
                     WHERE p.project_uid = ? AND o.organization_uid = ?",
            )
            .bind(&proj_uid_header)
            .bind(&org_uid_header)
            .fetch_optional(&db)
            .await
            .map_err(|e| {
                println!("DB Error 4 - Project exists query: {:?}", e);
                ApiError::Internal("Failed to verify project existence".into())
            })?;

            if project_exists.is_none() {
                println!(
                    "Debug: Project {} not found in org {}",
                    proj_uid_header, org_uid_header
                );
                return Err(ApiError::BadRequest(
                    "Project not found or does not belong to organization".into(),
                ));
            }

            println!("Debug: Authentication successful!");

            Ok(ApiCaller {
                wallet_address,
                org_uid: org_uid_header,
                project_uid: proj_uid_header,
            })
        });

        ready(result)
    }
}
