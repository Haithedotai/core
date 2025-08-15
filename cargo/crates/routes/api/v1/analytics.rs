use crate::lib::extractors::AuthUser;
use crate::lib::{error::ApiError, respond, state::AppState};
use actix_web::{get, web, Responder};
use serde::Serialize;
use sqlx::FromRow;
use std::collections::HashMap;

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct TimeSeriesPoint {
    pub date: String,
    #[sqlx(rename = "event_count")]
    pub value: i64,
}

#[derive(Debug, FromRow)]
struct ModelUsageRecord {
    model_name: String,
    call_count: i64,
}

#[get("/org/{id}/overview")]
async fn get_organization_analytics(
    _user: AuthUser, 
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let org_id = path.into_inner();

    // Get total API calls for this organization
    let (total_api_calls,): (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM analytics_logs WHERE org_id = ? AND log_type LIKE 'api.call.%'",
    )
    .bind(org_id)
    .fetch_one(&state.db)
    .await?;

    // Get API calls by model (parse from log_type like 'api.call.gpt-4', 'api.call.gemini', etc.)
    let model_usage: Vec<ModelUsageRecord> = sqlx::query_as(
        "SELECT 
            CASE 
                WHEN log_type LIKE 'api.call.%' THEN SUBSTR(log_type, 10)
                ELSE 'unknown'
            END as model_name,
            COUNT(*) as call_count
        FROM analytics_logs 
        WHERE org_id = ? AND log_type LIKE 'api.call.%' 
        GROUP BY model_name"
    )
    .bind(org_id)
    .fetch_all(&state.db)
    .await?;

    let api_calls_by_model: HashMap<String, u64> = model_usage
        .into_iter()
        .map(|r| (r.model_name, r.call_count as u64))
        .collect();

    // Get 30-day trends
    let api_calls_trends: Vec<TimeSeriesPoint> = sqlx::query_as(
        "SELECT DATE(created_at) as date, COUNT(*) as event_count 
        FROM analytics_logs 
        WHERE org_id = ? AND log_type LIKE 'api.call.%' 
        AND created_at >= DATE('now', '-30 days') 
        GROUP BY DATE(created_at) 
        ORDER BY date"
    )
    .bind(org_id)
    .fetch_all(&state.db)
    .await?;

    Ok(respond::ok("Organization analytics retrieved", serde_json::json!({
        "totalApiCalls": total_api_calls,
        "apiCallsByModel": api_calls_by_model,
        "apiCallsTrends": api_calls_trends
    })))
}

#[get("/project/{project_id}/dashboard")]
async fn get_project_analytics(
    user: AuthUser,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = path.into_inner();
    
    // Verify user has access to this project
    let has_access = check_project_access(&user.wallet_address, project_id, &state.db).await?;
    
    if !has_access {
        return Err(ApiError::Forbidden);
    }

    // Get total API calls for this project
    let (total_api_calls,): (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM analytics_logs WHERE project_id = ? AND log_type LIKE 'api.call.%'",
    )
    .bind(project_id)
    .fetch_one(&state.db)
    .await?;

    // Get 30-day trends for this project
    let api_calls_trends: Vec<TimeSeriesPoint> = sqlx::query_as(
        "SELECT DATE(created_at) as date, COUNT(*) as event_count 
        FROM analytics_logs 
        WHERE project_id = ? AND log_type LIKE 'api.call.%' 
        AND created_at >= DATE('now', '-30 days') 
        GROUP BY DATE(created_at) 
        ORDER BY date"
    )
    .bind(project_id)
    .fetch_all(&state.db)
    .await?;

    Ok(respond::ok("Project analytics retrieved", serde_json::json!({
        "totalApiCalls": total_api_calls,
        "apiCallsTrends": api_calls_trends
    })))
}

async fn check_project_access(
    wallet_address: &str,
    project_id: i64,
    db: &sqlx::SqlitePool,
) -> Result<bool, sqlx::Error> {
    // Check if user is a member of the project or organization
    let count: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM projects p 
         LEFT JOIN project_members pm ON p.id = pm.project_id 
         LEFT JOIN organizations o ON p.org_id = o.id 
         LEFT JOIN org_members om ON o.id = om.org_id 
         WHERE p.id = ? AND (
             pm.wallet_address = ? OR 
             o.owner = ? OR 
             om.wallet_address = ?
         )",
    )
    .bind(project_id)
    .bind(wallet_address)
    .bind(wallet_address)
    .bind(wallet_address)
    .fetch_one(db)
    .await?;

    Ok(count.0 > 0)
}

#[get("/user/dashboard")]
async fn get_user_analytics(
    user: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let wallet = &user.wallet_address;

    let (total_api_calls,): (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM analytics_logs WHERE user_wallet_address = ? AND log_type LIKE 'api.call.%'",
    )
    .bind(wallet)
    .fetch_one(&state.db)
    .await?;

    // Get most used model for this user
    let most_used_model: Option<String> = sqlx::query_scalar(
        "SELECT SUBSTR(log_type, 10) as model_name 
        FROM analytics_logs 
        WHERE user_wallet_address = ? AND log_type LIKE 'api.call.%' 
        GROUP BY model_name 
        ORDER BY COUNT(*) DESC 
        LIMIT 1"
    )
    .bind(wallet)
    .fetch_optional(&state.db)
    .await?;

    // Get user activity trends
    let activity_trends: Vec<TimeSeriesPoint> = sqlx::query_as(
        "SELECT DATE(created_at) as date, COUNT(*) as event_count 
        FROM analytics_logs 
        WHERE user_wallet_address = ? AND log_type LIKE 'api.call.%' 
        AND created_at >= DATE('now', '-30 days') 
        GROUP BY DATE(created_at) 
        ORDER BY date"
    )
    .bind(wallet)
    .fetch_all(&state.db)
    .await?;

    Ok(respond::ok("User analytics retrieved", serde_json::json!({
        "totalApiCalls": total_api_calls,
        "mostUsedModel": most_used_model,
        "activityTrends": activity_trends
    })))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_organization_analytics)
        .service(get_project_analytics)
        .service(get_user_analytics);
}