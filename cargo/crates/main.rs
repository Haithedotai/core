use crate::lib::discord::sync_discord_bots;
use crate::lib::state;
use crate::lib::telegram::sync_bots;
use crate::routes::routes;
use actix_cors::Cors;
use actix_web::middleware;
use actix_web::{App, HttpResponse, HttpServer, Responder, web};
use serde_json::json;
use sqlx::{Executor, SqlitePool};
use state::AppState;
use std::collections::HashMap;
use std::fs;
use std::sync::Mutex;

mod lib;
mod macros;
mod routes;
mod utils;

async fn health() -> impl Responder {
    HttpResponse::Ok().json(json!({ "status": "ok" }))
}

async fn ensure_db_migration(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    let sql = fs::read_to_string("data/migrations/up.sql").expect("Failed to read SQL file");

    pool.execute(sql.as_str()).await?;
    Ok(())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();

    let db_url = std::env::var("DATABASE_URL").unwrap();
    let db_path = db_url.strip_prefix("sqlite://").unwrap_or(&db_url);
    if !std::path::Path::new(db_path).exists() {
        println!("Database file '{}' does not exist. Creating it...", db_path);
        std::fs::File::create(db_path).expect("Failed to create database file");
    }

    let db_pool = SqlitePool::connect(&db_url).await.unwrap();

    ensure_db_migration(&db_pool)
        .await
        .expect("Database migration failed");

    let global_app_state = web::Data::new(AppState {
        nonce_registry: Mutex::new(HashMap::new()),
        db: db_pool,
        window_buffer_memory: Mutex::new(HashMap::new()),
        discord_bots: Mutex::new(HashMap::new()),
        telegram_bots: Mutex::new(HashMap::new()),
    });

    {
        let state_clone = global_app_state.clone();
        tokio::spawn(async move {
            if let Err(e) = sync_bots(state_clone.clone()).await {
                eprintln!("Failed to sync Telegram bots at startup: {}", e);
            }
        });
    }

    {
        let state_clone = global_app_state.clone();
        tokio::spawn(async move {
            if let Err(e) = sync_discord_bots(state_clone.clone()).await {
                eprintln!("Failed to sync Discord bots at startup: {}", e);
            }
        });
    }

    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("Invalid port number");

    println!("Starting server on port {}", port);
    HttpServer::new(move || {
        App::new()
            .wrap(middleware::Logger::default())
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allowed_methods(vec!["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"])
                    .allowed_headers(vec![
                        actix_web::http::header::AUTHORIZATION,
                        actix_web::http::header::CONTENT_TYPE,
                        actix_web::http::header::HeaderName::from_static("haithe-organization"),
                        actix_web::http::header::HeaderName::from_static("haithe-project"),
                        actix_web::http::header::HeaderName::from_static("openai-organization"),
                        actix_web::http::header::HeaderName::from_static("openai-project"),
                    ])
                    .supports_credentials()
                    .max_age(3600),
            )
            .app_data(global_app_state.clone())
            .route("/health", web::get().to(health))
            .configure(routes)
    })
    .bind(("127.0.0.1", port))?
    .run()
    .await?;

    Ok(())
}
