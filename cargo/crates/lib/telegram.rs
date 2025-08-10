use crate::lib::llm::{LlmResponseParams, generate_llm_response};
use crate::lib::state::AppState;
use crate::lib::state::TelegramBotHandle;
use actix_web::web;
use anyhow::Error;
use serde_json::json;
use std::sync::Arc;
use teloxide::prelude::*;
use tokio::task::JoinHandle;

async fn start_bot(
    token: String,
    org_uid: String,
    project_uid: String,
    state: web::Data<AppState>,
) -> Result<TelegramBotHandle, Error> {
    let telegram_bot = Bot::new(token.clone());

    let handler = Update::filter_message().endpoint({
        let org_uid = org_uid.clone();
        let project_uid = project_uid.clone();
        let state = state.clone();

        move |bot: Bot, msg: Message| {
            let org_uid = org_uid.clone();
            let project_uid = project_uid.clone();
            let state = state.clone();

            async move {
                if let Some(text) = msg.text() {
                    let params = LlmResponseParams {
                        model: "gemini-2.0-flash".to_string(),
                        messages: vec![json!({
                            "role": "user",
                            "content": format!("You are a bot with access to telegram, always send plain text as if you were responding to a user message, please do not use markdown only use telegram supported formatting\n {}", text)
                        })],
                        temperature: 0.7,
                        n: 1,
                        org_uid,
                        project_uid,
                    };

                    match generate_llm_response(params, state.get_ref()).await {
                        Ok(response) => {
                            if let Some(choice) = response.choices.first() {
                                if let Some(content) = choice
                                    .get("message")
                                    .and_then(|m| m.get("content"))
                                    .and_then(|c| c.as_str())
                                {
                                    if let Err(e) = bot.send_message(msg.chat.id, content).await {
                                        eprintln!("Failed to send message: {}", e);
                                    }
                                } else {
                                    if let Err(e) = bot
                                        .send_message(
                                            msg.chat.id,
                                            "Sorry, I couldn't generate a response.",
                                        )
                                        .await
                                    {
                                        eprintln!("Failed to send message: {}", e);
                                    }
                                }
                            } else {
                                if let Err(e) = bot
                                    .send_message(
                                        msg.chat.id,
                                        "Sorry, I couldn't generate a response.",
                                    )
                                    .await
                                {
                                    eprintln!("Failed to send message: {}", e);
                                }
                            }
                        }
                        Err(e) => {
                            if let Err(send_err) =
                                bot.send_message(msg.chat.id, format!("Error: {}", e)).await
                            {
                                eprintln!("Failed to send error message: {}", send_err);
                            }
                        }
                    }
                } else {
                    let params = LlmResponseParams {
                        model: "gemini-2.0-flash".to_string(),
                        messages: vec![json!({
                            "role": "server",
                            "content": "introduce yourself and ask the user to send an input"
                        })],
                        temperature: 0.7,
                        n: 1,
                        org_uid,
                        project_uid,
                    };

                    match generate_llm_response(params, state.get_ref()).await {
                        Ok(response) => {
                            if let Some(choice) = response.choices.first() {
                                if let Some(content) = choice
                                    .get("message")
                                    .and_then(|m| m.get("content"))
                                    .and_then(|c| c.as_str())
                                {
                                    if let Err(e) = bot.send_message(msg.chat.id, content).await {
                                        eprintln!("Failed to send message: {}", e);
                                    }
                                } else {
                                    if let Err(e) = bot
                                        .send_message(
                                            msg.chat.id,
                                            "Sorry, I couldn't generate a response.",
                                        )
                                        .await
                                    {
                                        eprintln!("Failed to send message: {}", e);
                                    }
                                }
                            } else {
                                if let Err(e) = bot
                                    .send_message(
                                        msg.chat.id,
                                        "Sorry, I couldn't generate a response.",
                                    )
                                    .await
                                {
                                    eprintln!("Failed to send message: {}", e);
                                }
                            }
                        }
                        Err(e) => {
                            if let Err(send_err) =
                                bot.send_message(msg.chat.id, format!("Error: {}", e)).await
                            {
                                eprintln!("Failed to send error message: {}", send_err);
                            }
                        }
                    }
                }
                respond(())
            }
        }
    });
    let join: JoinHandle<()> = tokio::spawn(async move {
        let listener = teloxide::update_listeners::polling_default(telegram_bot.clone()).await;
        Dispatcher::builder(telegram_bot, handler)
            .build()
            .dispatch_with_listener(listener, LoggingErrorHandler::new())
            .await;
    });

    Ok(TelegramBotHandle { join })
}

pub async fn sync_bots(state: web::Data<AppState>) -> Result<(), Error> {
    {
        let mut registry = state.get_ref().telegram_bots.lock().unwrap();
        for (_token, handle) in registry.drain() {
            handle.join.abort();
        }
    }

    #[derive(sqlx::FromRow)]
    struct Row {
        token: String,
        org_uid: String,
        project_uid: String,
    }

    let rows: Vec<Row> = sqlx::query_as::<_, Row>(
        r#"
        SELECT pr.teloxide_token as token,
               o.organization_uid as org_uid,
               pr.project_uid as project_uid
        FROM projects pr
        JOIN organizations o ON o.id = pr.org_id
        WHERE pr.teloxide_token IS NOT NULL AND pr.teloxide_token != ''
        GROUP BY pr.teloxide_token, o.organization_uid, pr.project_uid
        "#,
    )
    .fetch_all(&state.get_ref().db)
    .await?;

    for row in rows {
        let handle = start_bot(
            row.token.clone(),
            row.org_uid.clone(),
            row.project_uid.clone(),
            state.clone(),
        )
        .await?;
        state
            .get_ref()
            .telegram_bots
            .lock()
            .unwrap()
            .insert(row.token, handle);
    }

    Ok(())
}
