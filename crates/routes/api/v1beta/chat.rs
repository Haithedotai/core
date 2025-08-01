use crate::lib::{error::ApiError, extractors::AuthUser, respond, state::AppState};
use actix_web::{HttpResponse, Responder, get, patch, post, web};
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize)]
struct Conversation {
    id: i32,
    title: String,
    created_at: String,
    updated_at: String,
}

#[get("/conversations")]
pub async fn get_conversations_handlers(
    auth_user: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let conversations = sqlx::query_as::<_, Conversation>(
        "SELECT id, title, created_at, updated_at FROM conversations WHERE wallet_address = ?",
    )
    .bind(&auth_user.wallet_address)
    .fetch_all(&state.db)
    .await
    .map_err(|_| ApiError::Internal("DB error".into()))?;

    Ok(respond::ok(
        "conversations fetched",
        web::Json(conversations),
    ))
}

#[post("/conversations")]
pub async fn post_conversations_handlers(
    auth_user: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let result = sqlx::query("INSERT INTO conversations (title, wallet_address) VALUES (?, ?) RETURNING id, title, created_at, updated_at")
        .bind(&format!(
            "New Conversation {}",
            uuid::Uuid::new_v4().to_string().slice(0, 4)
        ))
        .bind(&auth_user.wallet_address)
        .fetch_one(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::Internal("Failed to create conversation".into()));
    }

    Ok(respond::created("conversation created", web::Json(result)))
}

#[derive(Deserialize)]
struct PatchConversationBody {
    title: String,
}

#[patch("/conversations/{id}")]
pub async fn patch_conversations_handlers(
    auth_user: AuthUser,
    state: web::Data<AppState>,
    web::Path(id): web::Path<i32>,
    web::Json(payload): web::Json<PatchConversationBody>,
) -> Result<impl Responder, ApiError> {
    let result = sqlx::query("UPDATE conversations SET title = ? WHERE id = ? AND wallet_address = ? RETURNING id, title, created_at, updated_at")
        .bind(&payload.title)
        .bind(id)
        .bind(&auth_user.wallet_address)
        .fetch_one(&state.db)
        .await?;

    Ok(respond::ok("conversation updated", web::Json(result)))
}

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(get_conversations_handlers);
}
