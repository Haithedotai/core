use alith::WindowBufferMemory;
use sqlx::SqlitePool;
use std::collections::HashMap;
use std::sync::Mutex;
use tokio::task::JoinHandle;

pub struct TelegramBotHandle {
    pub join: JoinHandle<()>,
}

pub struct AppState {
    pub nonce_registry: Mutex<HashMap<String, String>>,
    pub db: SqlitePool,
    pub window_buffer_memory: Mutex<HashMap<String, WindowBufferMemory>>,
    // key: bot token
    pub telegram_bots: Mutex<HashMap<String, TelegramBotHandle>>,
}
