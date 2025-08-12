use sqlx::SqlitePool;
use std::sync::Arc;
use uuid::Uuid;

/// Logs an API call asynchronously for analytics tracking
/// This function is non-blocking and won't affect API response times
pub fn log_api_call_async(
    db_pool: Arc<SqlitePool>,
    project_id: i64,
    org_id: i64,
    user_wallet: String,
    model_name: String,
) {
    // Spawn a "fire-and-forget" background task
    // The main function will not wait for this to complete
    tokio::spawn(async move {
        // Generate a unique ID for this specific call
        let call_uid = Uuid::new_v4().to_string();

        // Insert the record into the database
        let insert_result = sqlx::query(
            r#"
            INSERT INTO api_calls 
            (call_uid, project_id, org_id, user_wallet_address, model_used)
            VALUES (?, ?, ?, ?, ?)
            "#
        )
        .bind(call_uid)
        .bind(project_id)
        .bind(org_id)
        .bind(user_wallet)
        .bind(model_name)
        .execute(&*db_pool)
        .await;

        if let Err(e) = insert_result {
            // Log errors to stderr for monitoring
            eprintln!("Failed to log API call for analytics: {}", e);
        }
    });
}

/// Alternative version that returns the call_uid for tracking purposes
pub fn log_api_call_with_uid(
    db_pool: Arc<SqlitePool>,
    project_id: i64,
    org_id: i64,
    user_wallet: String,
    model_name: String,
) -> String {
    let call_uid = Uuid::new_v4().to_string();
    let call_uid_clone = call_uid.clone();

    tokio::spawn(async move {
        let insert_result = sqlx::query(
            r#"
            INSERT INTO api_calls 
            (call_uid, project_id, org_id, user_wallet_address, model_used)
            VALUES (?, ?, ?, ?, ?)
            "#
        )
        .bind(call_uid_clone)
        .bind(project_id)
        .bind(org_id)
        .bind(user_wallet)
        .bind(model_name)
        .execute(&*db_pool)
        .await;

        if let Err(e) = insert_result {
            eprintln!("Failed to log API call for analytics: {}", e);
        }
    });

    call_uid
}
