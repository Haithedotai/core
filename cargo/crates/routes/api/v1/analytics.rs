use crate::lib::extractors::AuthUser;
use crate::lib::{error::ApiError, respond, state::AppState};
use actix_web::{get, web, Responder};
use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::FromRow;
use std::collections::HashMap;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrganizationAnalytics {
    pub total_api_calls: u64,
    pub api_calls_by_model: HashMap<String, u64>,
    pub api_calls_trends: Vec<TimeSeriesPoint>,
    pub active_projects: u64,
    pub total_projects: u64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectAnalytics {
    pub project_id: i64,
    pub project_name: String,
    pub total_api_calls: u64,
    pub total_conversations: u64,
    pub is_active: bool,
    pub search_enabled: bool,
    pub memory_enabled: bool,
    pub team_size: u64,
    pub enabled_products_count: u64,
    pub last_activity: Option<DateTime<Utc>>,
    pub api_calls_trends: Vec<TimeSeriesPoint>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserAnalytics {
    pub total_api_calls: u64,
    pub total_conversations: u64,
    pub most_used_model: Option<String>,
    pub projects_count: u64,
    pub organizations_count: u64,
    pub activity_trends: Vec<TimeSeriesPoint>,
}

#[derive(Debug, Serialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct TimeSeriesPoint {
    pub date: String,
    #[sqlx(rename = "call_count")]
    pub value: i64,
}

#[derive(Debug, FromRow)]
struct ModelUsageRecord {
    model_used: String,
    call_count: i64,
}

#[get("/org/{id}/overview")]
async fn get_organization_analytics(
    _user: AuthUser, // TODO: Add permission check to verify user has access to this organization
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let org_id = path.into_inner();

    let (total_api_calls,): (i64,) =
        sqlx::query_as("SELECT COUNT(id) FROM api_calls WHERE org_id = ?")
            .bind(org_id)
            .fetch_one(&state.db)
            .await?;

    let model_usage: Vec<ModelUsageRecord> = sqlx::query_as(
        "SELECT model_used, COUNT(id) as call_count FROM api_calls WHERE org_id = ? GROUP BY model_used",
    )
    .bind(org_id)
    .fetch_all(&state.db)
    .await?;
    let api_calls_by_model: HashMap<String, u64> = model_usage
        .into_iter()
        .map(|r| (r.model_used, r.call_count as u64))
        .collect();

    let api_calls_trends: Vec<TimeSeriesPoint> = sqlx::query_as(
        r#"
        SELECT DATE(created_at) as date, COUNT(id) as call_count
        FROM api_calls
        WHERE org_id = ? AND created_at >= DATE('now', '-30 days')
        GROUP BY DATE(created_at) ORDER BY date
        "#,
    )
    .bind(org_id)
    .fetch_all(&state.db)
    .await?;

    let (active_projects, total_projects): (i64, i64) = sqlx::query_as(
        r#"
        SELECT
            COUNT(CASE WHEN p.last_activity >= DATE('now', '-7 days') THEN 1 END) as active_projects,
            COUNT(p.id) as total_projects
        FROM projects p WHERE p.org_id = ?
        "#,
    )
    .bind(org_id)
    .fetch_one(&state.db)
    .await
    .unwrap_or((0, 0));

    let analytics = OrganizationAnalytics {
        total_api_calls: total_api_calls as u64,
        api_calls_by_model,
        api_calls_trends,
        active_projects: active_projects as u64,
        total_projects: total_projects as u64,
    };

    Ok(respond::ok("Organization analytics retrieved", analytics))
}


#[get("/project/{id}/summary")]
async fn get_project_analytics(
    _user: AuthUser, // TODO: Add permission check to verify user has access to this project
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let project_id = path.into_inner();

    let (total_api_calls,): (i64,) =
        sqlx::query_as("SELECT COUNT(id) FROM api_calls WHERE project_id = ?")
            .bind(project_id)
            .fetch_one(&state.db)
            .await?;

    let api_calls_trends: Vec<TimeSeriesPoint> = sqlx::query_as(
        r#"
        SELECT DATE(created_at) as date, COUNT(id) as call_count
        FROM api_calls
        WHERE project_id = ? AND created_at >= DATE('now', '-30 days')
        GROUP BY DATE(created_at) ORDER BY date
        "#,
    )
    .bind(project_id)
    .fetch_all(&state.db)
    .await?;

    // Fetch actual project details from database
    let project_info: Option<(String, Option<String>, bool, bool)> = sqlx::query_as(
        "SELECT name, last_activity, search_enabled, memory_enabled FROM projects WHERE id = ?"
    )
    .bind(project_id)
    .fetch_optional(&state.db)
    .await?;

    let (project_name, last_activity_str, search_enabled, memory_enabled) = project_info
        .unwrap_or_else(|| ("Unknown Project".to_string(), None, false, false));

    // Convert last_activity string to DateTime<Utc> if it exists
    let last_activity = last_activity_str
        .and_then(|s| s.parse::<DateTime<Utc>>().ok());

    // Calculate if project is active (has activity in last 7 days)
    let is_active = last_activity
        .map(|activity| {
            let seven_days_ago = Utc::now() - chrono::Duration::days(7);
            activity > seven_days_ago
        })
        .unwrap_or(false);

    // Get team size (count of project members)
    let (team_size,): (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM project_members WHERE project_id = ?"
    )
    .bind(project_id)
    .fetch_one(&state.db)
    .await
    .unwrap_or((0,));

    // Get enabled products count
    let (enabled_products_count,): (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM project_products WHERE project_id = ? AND enabled = 1"
    )
    .bind(project_id)
    .fetch_one(&state.db)
    .await
    .unwrap_or((0,));

    let analytics = ProjectAnalytics {
        project_id,
        project_name,
        total_api_calls: total_api_calls as u64,
        total_conversations: 0, // Conversations are tracked at user level, not project level
        is_active,
        search_enabled,
        memory_enabled,
        team_size: team_size as u64,
        enabled_products_count: enabled_products_count as u64,
        last_activity,
        api_calls_trends,
    };

    Ok(respond::ok("Project analytics retrieved", analytics))
}


#[get("/user/dashboard")]
async fn get_user_analytics(
    user: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let wallet = &user.wallet_address;

    let (total_api_calls,): (i64,) =
        sqlx::query_as("SELECT COUNT(id) FROM api_calls WHERE user_wallet_address = ?")
            .bind(wallet)
            .fetch_one(&state.db)
            .await?;

    let most_used_model: Option<String> = sqlx::query_scalar(
        "SELECT model_used FROM api_calls WHERE user_wallet_address = ? GROUP BY model_used ORDER BY COUNT(id) DESC LIMIT 1"
    )
    .bind(wallet)
    .fetch_optional(&state.db)
    .await?;

    // Other metrics like projects_count and organizations_count 
    let (organizations_count,): (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM (SELECT id FROM organizations WHERE owner = ? UNION SELECT org_id FROM org_members WHERE wallet_address = ?)",
    )
    .bind(wallet).bind(wallet)
    .fetch_one(&state.db)
    .await?;

    let (projects_count,): (i64,) = sqlx::query_as(
        "SELECT COUNT(DISTINCT project_id) FROM project_members WHERE wallet_address = ?",
    )
    .bind(wallet)
    .fetch_one(&state.db)
    .await?;

    let activity_trends: Vec<TimeSeriesPoint> = sqlx::query_as(
        r#"
        SELECT DATE(created_at) as date, COUNT(id) as call_count
        FROM api_calls
        WHERE user_wallet_address = ? AND created_at >= DATE('now', '-30 days')
        GROUP BY DATE(created_at) ORDER BY date
        "#,
    )
    .bind(wallet)
    .fetch_all(&state.db)
    .await?;

    // Get total conversations for this user
    let (total_conversations,): (i64,) = sqlx::query_as(
        "SELECT COUNT(id) FROM conversations WHERE wallet_address = ?"
    )
    .bind(wallet)
    .fetch_one(&state.db)
    .await
    .unwrap_or((0,));

    let analytics = UserAnalytics {
        total_api_calls: total_api_calls as u64,
        total_conversations: total_conversations as u64,
        most_used_model,
        projects_count: projects_count as u64,
        organizations_count: organizations_count as u64,
        activity_trends,
    };

    Ok(respond::ok("User dashboard analytics retrieved", analytics))
}


pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_organization_analytics)
        .service(get_project_analytics)
        .service(get_user_analytics);
}