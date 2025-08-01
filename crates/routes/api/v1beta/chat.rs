use crate::lib::{error::ApiError, extractors::AuthUser, respond, state::AppState};
use actix_web::{HttpResponse, Responder, delete, get, patch, post, web};
use serde::Serialize;
use sqlx::FromRow;

#[derive(Debug, Clone, FromRow, Serialize)]
struct Conversation {
    id: i32,
    title: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Clone, FromRow, Serialize)]
struct Message {
    id: i32,
    message: String,
    sender: String,
    created_at: String,
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

#[get("/conversations/{id}")]
pub async fn get_conversation_handler(
    auth_user: AuthUser,
    state: web::Data<AppState>,
    web::Path(id): web::Path<i32>,
) -> Result<impl Responder, ApiError> {
    let conversation = sqlx::query_as::<_, Conversation>(
        "SELECT id, title, created_at, updated_at FROM conversations WHERE id = ? AND wallet_address = ?",
    )
    .bind(id)
    .bind(&auth_user.wallet_address)
    .fetch_one(&state.db)
    .await
    .map_err(|_| ApiError::NotFound("Conversation not found".into()))?;

    Ok(respond::ok("conversation fetched", web::Json(conversation)))
}

#[delete("/conversations/{id}")]
pub async fn delete_conversation_handler(
    auth_user: AuthUser,
    state: web::Data<AppState>,
    web::Path(id): web::Path<i32>,
) -> Result<impl Responder, ApiError> {
    let result = sqlx::query("DELETE FROM conversations WHERE id = ? AND wallet_address = ?")
        .bind(id)
        .bind(&auth_user.wallet_address)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Conversation not found".into()));
    }

    Ok(respond::ok("conversation deleted", web::Json(result)))
}

#[get("/conversations/{id}/messages")]
pub async fn get_conversation_messages_handler(
    auth_user: AuthUser,
    state: web::Data<AppState>,
    web::Path(id): web::Path<i32>,
) -> Result<impl Responder, ApiError> {
    let messages = sqlx::query_as::<_, Message>(
        "SELECT id, content, created_at, updated_at FROM messages WHERE conversation_id = ?",
    )
    .bind(id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| ApiError::Internal("DB error".into()))?;

    Ok(respond::ok("messages fetched", web::Json(messages)))
}

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(get_conversations_handlers)
        .service(post_conversations_handlers)
        .service(patch_conversations_handlers)
        .service(get_conversation_handler)
        .service(delete_conversation_handler)
        .service(get_conversation_messages_handler);
}
