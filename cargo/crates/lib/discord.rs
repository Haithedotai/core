use crate::lib::llm::{LlmResponseParams, generate_llm_response};
use crate::lib::models::get_model_by_id;
use crate::lib::state::{AppState, DiscordBotHandle};
use actix_web::web;
use anyhow::Error;
use serde_json::json;
use serenity::{async_trait, model::prelude::*, prelude::*};
use std::sync::Arc;
use tokio::task::JoinHandle;

struct Handler {
    org_uid: String,
    project_uid: String,
    model_name: String,
    state: Arc<AppState>,
}

#[async_trait]
impl EventHandler for Handler {
    async fn message(&self, ctx: Context, msg: Message) {
        // Ignore messages from bots (including itself)
        if msg.author.bot {
            return;
        }

        let params = LlmResponseParams {
            model: self.model_name.clone(),
            messages: vec![json!({
                "role": "user",
                "content": format!("You are a bot created with Haithe for Discord, always send plain text.\n{}", msg.content)
            })],
            temperature: 0.7,
            n: 1,
            org_uid: self.org_uid.clone(),
            project_uid: self.project_uid.clone(),
        };

        match generate_llm_response(params, &self.state).await {
            Ok(response) => {
                if let Some(choice) = response.choices.first() {
                    if let Some(content) = choice
                        .get("message")
                        .and_then(|m| m.get("content"))
                        .and_then(|c| c.as_str())
                    {
                        if let Err(e) = msg.channel_id.say(&ctx.http, content).await {
                            eprintln!("Failed to send message: {}", e);
                        }
                    }
                }
            }
            Err(e) => {
                let _ = msg.channel_id.say(&ctx.http, format!("Error: {}", e)).await;
            }
        }
    }
}

pub async fn start_discord_bot(
    token: String,
    org_uid: String,
    project_uid: String,
    model_name: String,
    state: web::Data<AppState>,
) -> Result<DiscordBotHandle, Error> {
    let handler = Handler {
        org_uid,
        project_uid,
        model_name,
        state: state.into_inner(),
    };

    let join: JoinHandle<()> = tokio::spawn(async move {
        let mut client = serenity::Client::builder(
            &token,
            GatewayIntents::non_privileged() | GatewayIntents::MESSAGE_CONTENT,
        )
        .event_handler(handler)
        .await
        .expect("Error creating Discord client");

        if let Err(why) = client.start().await {
            eprintln!("Discord client ended: {:?}", why);
        }
    });

    Ok(DiscordBotHandle { join })
}

pub async fn sync_discord_bots(state: web::Data<AppState>) -> Result<(), Error> {
    {
        let mut registry = state.get_ref().discord_bots.lock().unwrap();
        for (_token, handle) in registry.drain() {
            handle.join.abort();
        }
    }

    #[derive(sqlx::FromRow)]
    struct Row {
        token: String,
        org_uid: String,
        project_uid: String,
        default_model_id: Option<i64>,
    }

    let rows: Vec<Row> = sqlx::query_as::<_, Row>(
        r#"
        SELECT pr.discord_token as token,
               o.organization_uid as org_uid,
               pr.project_uid as project_uid,
               pr.default_model_id as default_model_id
        FROM projects pr
        JOIN organizations o ON o.id = pr.org_id
        WHERE pr.discord_token IS NOT NULL AND pr.discord_token != ''
        GROUP BY pr.discord_token, o.organization_uid, pr.project_uid, pr.default_model_id
        "#,
    )
    .fetch_all(&state.get_ref().db)
    .await?;

    for row in rows {
        // Get the model name from the default_model_id, fallback to gemini-2.0-flash if not set
        let model_name = if let Some(model_id) = row.default_model_id {
            get_model_by_id(model_id as u64)
                .map(|model| model.name)
                .unwrap_or_else(|| "gemini-2.0-flash".to_string())
        } else {
            "gemini-2.0-flash".to_string()
        };

        let handle = start_discord_bot(
            row.token.clone(),
            row.org_uid.clone(),
            row.project_uid.clone(),
            model_name,
            state.clone(),
        )
        .await?;
        state
            .get_ref()
            .discord_bots
            .lock()
            .unwrap()
            .insert(row.token, handle);
    }

    Ok(())
}
