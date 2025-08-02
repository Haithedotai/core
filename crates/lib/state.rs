use alith::WindowBufferMemory;
use sqlx::SqlitePool;
use std::collections::HashMap;
use std::sync::Mutex;

pub struct AppState {
    pub nonce_registry: Mutex<HashMap<String, String>>,
    pub db: SqlitePool,
    pub window_buffer_memory: Mutex<HashMap<String, WindowBufferMemory>>,
}
