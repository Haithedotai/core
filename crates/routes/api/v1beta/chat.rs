use crate::lib::{error::ApiError, extractors::ApiCaller, respond, state::AppState};
use actix_web::{HttpResponse, Responder, delete, get, patch, post, web};
use serde::{Deserialize, Serialize};
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
    api_caller: ApiCaller,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let conversations = sqlx::query_as::<_, Conversation>(
        "SELECT id, title, created_at, updated_at FROM conversations WHERE wallet_address = ?",
    )
    .bind(&api_caller.wallet_address)
    .fetch_all(&state.db)
    .await
    .map_err(|_| ApiError::Internal("DB error".into()))?;

    Ok(respond::ok(
        "conversations fetched",
        serde_json::json!(conversations),
    ))
}

#[post("/conversations")]
pub async fn post_conversations_handlers(
    api_caller: ApiCaller,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let conversation = sqlx::query_as::<_, Conversation>(
        "INSERT INTO conversations (title, wallet_address) VALUES (?, ?) RETURNING id, title, created_at, updated_at"
    )
        .bind(&format!(
            "New Conversation {}",
            uuid::Uuid::new_v4().to_string()[0..8].to_string()
        ))
        .bind(&api_caller.wallet_address)
        .fetch_one(&state.db)
        .await?;

    Ok(respond::ok(
        "conversation created",
        serde_json::json!(conversation),
    ))
}

#[derive(Deserialize)]
struct PatchConversationBody {
    title: String,
}

#[derive(Deserialize)]
struct CreateMessageBody {
    message: String,
    sender: String,
}

#[patch("/conversations/{id}")]
pub async fn patch_conversations_handlers(
    api_caller: ApiCaller,
    state: web::Data<AppState>,
    path: web::Path<i32>,
    web::Json(payload): web::Json<PatchConversationBody>,
) -> Result<impl Responder, ApiError> {
    let id = path.into_inner();
    let conversation = sqlx::query_as::<_, Conversation>(
        "UPDATE conversations SET title = ? WHERE id = ? AND wallet_address = ? RETURNING id, title, created_at, updated_at"
    )
        .bind(&payload.title)
        .bind(id)
        .bind(&api_caller.wallet_address)
        .fetch_one(&state.db)
        .await?;

    Ok(respond::ok(
        "conversation updated",
        serde_json::json!(conversation),
    ))
}

#[get("/conversations/{id}")]
pub async fn get_conversation_handler(
    api_caller: ApiCaller,
    state: web::Data<AppState>,
    path: web::Path<i32>,
) -> Result<impl Responder, ApiError> {
    let id = path.into_inner();
    let conversation = sqlx::query_as::<_, Conversation>(
        "SELECT id, title, created_at, updated_at FROM conversations WHERE id = ? AND wallet_address = ?",
    )
    .bind(id)
    .bind(&api_caller.wallet_address)
    .fetch_one(&state.db)
    .await
    .map_err(|_| ApiError::NotFound("Conversation not found".into()))?;

    Ok(respond::ok(
        "conversation fetched",
        serde_json::json!(conversation),
    ))
}

#[delete("/conversations/{id}")]
pub async fn delete_conversation_handler(
    api_caller: ApiCaller,
    state: web::Data<AppState>,
    path: web::Path<i32>,
) -> Result<impl Responder, ApiError> {
    let id = path.into_inner();
    let result = sqlx::query("DELETE FROM conversations WHERE id = ? AND wallet_address = ?")
        .bind(id)
        .bind(&api_caller.wallet_address)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(ApiError::NotFound("Conversation not found".into()));
    }

    Ok(respond::ok(
        "conversation deleted",
        serde_json::json!({ "rows_affected": result.rows_affected() }),
    ))
}

#[get("/conversations/{id}/messages")]
pub async fn get_conversation_messages_handler(
    api_caller: ApiCaller,
    state: web::Data<AppState>,
    path: web::Path<i32>,
) -> Result<impl Responder, ApiError> {
    let id = path.into_inner();
    // First verify the conversation belongs to this user
    let _conversation = sqlx::query_scalar::<_, i32>(
        "SELECT id FROM conversations WHERE id = ? AND wallet_address = ?",
    )
    .bind(id)
    .bind(&api_caller.wallet_address)
    .fetch_one(&state.db)
    .await
    .map_err(|_| ApiError::NotFound("Conversation not found".into()))?;

    let messages = sqlx::query_as::<_, Message>(
        "SELECT id, message, sender, created_at FROM agent_preview_messages WHERE conversation_id = ?",
    )
    .bind(id)
    .fetch_all(&state.db)
    .await
    .map_err(|_| ApiError::Internal("DB error".into()))?;

    Ok(respond::ok("messages fetched", web::Json(messages)))
}

#[post("/conversations/{id}/messages")]
pub async fn post_conversation_messages_handler(
    api_caller: ApiCaller,
    state: web::Data<AppState>,
    path: web::Path<i32>,
    web::Json(payload): web::Json<CreateMessageBody>,
) -> Result<impl Responder, ApiError> {
    let id = path.into_inner();
    // First verify the conversation belongs to this user
    let _conversation = sqlx::query_scalar::<_, i32>(
        "SELECT id FROM conversations WHERE id = ? AND wallet_address = ?",
    )
    .bind(id)
    .bind(&api_caller.wallet_address)
    .fetch_one(&state.db)
    .await
    .map_err(|_| ApiError::NotFound("Conversation not found".into()))?;

    let message = sqlx::query_as::<_, Message>(
        "INSERT INTO agent_preview_messages (conversation_id, message, sender) VALUES (?, ?, ?) RETURNING id, message, sender, created_at"
    )
        .bind(id)
        .bind(&payload.message)
        .bind(&payload.sender)
        .fetch_one(&state.db)
        .await?;

    Ok(respond::ok("message created", web::Json(message)))
}

pub fn routes(cfg: &mut actix_web::web::ServiceConfig) {
    cfg.service(get_conversations_handlers)
        .service(post_conversations_handlers)
        .service(patch_conversations_handlers)
        .service(get_conversation_handler)
        .service(delete_conversation_handler)
        .service(get_conversation_messages_handler)
        .service(post_conversation_messages_handler);
}
