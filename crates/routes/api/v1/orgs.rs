use crate::lib::extractors::AuthUser;
use crate::lib::state;
use crate::lib::{contracts, error::ApiError, respond, state::AppState};
use actix_web::{Responder, delete, get, patch, post, web};
use ethers::contract::multicall_contract::Result;
use serde::{Deserialize, Serialize, de};
use sqlx::{FromRow, query};
use uuid::Uuid;

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct Organization {
    pub id: i64,
    pub organization_uid: String,
    pub address: String,
    pub orchestrator_idx: i64,
    pub name: String,
    pub owner: String,
    pub created_at: String,
}

#[derive(Debug, Clone, FromRow, Serialize)]
pub struct OrgMember {
    pub org_id: i64,
    pub wallet_address: String,
    pub role: String,
    pub created_at: String,
}

#[derive(Deserialize)]
struct PostMemberQuery {
    wallet_address: String,
    role: String,
}

#[derive(Deserialize)]
struct PatchMemberQuery {
    wallet_address: String,
    role: String,
}

#[derive(Deserialize)]
struct DeleteMemberQuery {
    wallet_address: String,
}

#[post("")]
async fn post_index_handler(
    _: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let highest_orchestrator_idx: i64 =
        sqlx::query_scalar("SELECT COALESCE(MAX(orchestrator_idx), 0) FROM organizations")
            .fetch_one(&state.db)
            .await?;
    let onchain_length: ethers::types::U256 = contracts::get_contract("HaitheOrchestrator", None)?
        .method::<_, ethers::types::U256>("organizationsCount", ())?
        .call()
        .await?;

    let mut synced_count: u32 = 0;

    // iterate from highest_orchestrator_idx + 1 to onchain_length
    for idx in (highest_orchestrator_idx + 1)..=onchain_length.as_u64() as i64 {
        let organization_uid = Uuid::new_v4().to_string().replace("-", "");

        // Convert to 0-based index for Solidity array access
        let solidity_idx = ethers::types::U256::from((idx - 1) as u64);
        let organization_address: ethers::types::Address =
            contracts::get_contract("HaitheOrchestrator", None)?
                .method::<_, ethers::types::Address>("organizations", solidity_idx)?
                .call()
                .await?;
        let organization_name: String = contracts::get_contract(
            "HaitheOrganization",
            Some(&format!("{:#x}", organization_address)),
        )?
        .method::<_, String>("name", ())?
        .call()
        .await?;
        let organization_owner: ethers::types::Address = contracts::get_contract(
            "HaitheOrganization",
            Some(&format!("{:#x}", organization_address)),
        )?
        .method::<_, ethers::types::Address>("owner", ())?
        .call()
        .await?;

        sqlx::query("INSERT OR IGNORE INTO accounts (wallet_address) VALUES (?);")
            .bind(&format!("{:#x}", organization_owner))
            .execute(&state.db)
            .await?;

        let org = sqlx::query_as::<_, Organization>(
            "INSERT INTO organizations (name, owner, organization_uid, orchestrator_idx, address) VALUES (?, ?, ?, ?, ?) RETURNING *",
        )
        .bind(&organization_name)
        .bind(&format!("{:#x}", organization_owner))
        .bind(&organization_uid)
        .bind(idx)
        .bind(&format!("{:#x}", organization_address))
        .fetch_one(&state.db)
        .await?;
        synced_count += 1;
    }

    Ok(respond::ok(
        "Organizations synced successfully",
        serde_json::json!({ "count": synced_count }),
    ))
}

#[get("/{id}")]
async fn get_org_handler(
    _: AuthUser,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let id = path.into_inner();
    if id <= 0 {
        return Err(ApiError::NotFound("Organization not found".to_string()));
    }

    let org = sqlx::query_as::<_, Organization>("SELECT * FROM organizations WHERE id = ?")
        .bind(id)
        .fetch_one(&state.db)
        .await?;

    Ok(respond::ok("Organization retrieved", org))
}

#[derive(Deserialize)]
struct PatchOrgQuery {
    name: String,
}

#[patch("/{id}")]
async fn patch_org_handler(
    user: AuthUser,
    path: web::Path<i64>,
    query: web::Query<PatchOrgQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let id = path.into_inner();
    let org_name = query.name.clone();

    if id <= 0 {
        return Err(ApiError::NotFound("Organization not found".to_string()));
    }

    let org = sqlx::query_as::<_, Organization>(
        "UPDATE organizations SET name = ? WHERE id = ? AND owner = ? RETURNING *",
    )
    .bind(&org_name)
    .bind(id)
    .bind(&user.wallet_address)
    .fetch_one(&state.db)
    .await?;

    Ok(respond::ok("Organization updated", org))
}

#[delete("/{id}")]
async fn delete_org_handler(
    user: AuthUser,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let id = path.into_inner();

    let org = sqlx::query_as::<_, Organization>(
        "DELETE FROM organizations WHERE id = ? AND owner = ? RETURNING *",
    )
    .bind(id)
    .bind(&user.wallet_address)
    .fetch_one(&state.db)
    .await?;

    Ok(respond::ok("Organization deleted", org))
}

#[get("/{id}/members")]
async fn get_org_members_handler(
    _: AuthUser,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let org_id = path.into_inner();

    let members = sqlx::query_as::<_, OrgMember>(
        "SELECT org_id, wallet_address, role, created_at FROM org_members WHERE org_id = ? ORDER BY created_at DESC"
    )
    .bind(org_id)
    .fetch_all(&state.db)
    .await?;

    Ok(respond::ok("Organization members retrieved", members))
}

#[post("/{id}/members")]
async fn post_org_members_handler(
    user: AuthUser,
    path: web::Path<i64>,
    query: web::Query<PostMemberQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let org_id = path.into_inner();

    let wallet_address = query.wallet_address.to_lowercase();

    let owner_check = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM organizations WHERE id = ? AND owner = ?",
    )
    .bind(org_id)
    .bind(&user.wallet_address)
    .fetch_one(&state.db)
    .await?;

    let admin_check = if owner_check == 0 {
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM org_members WHERE org_id = ? AND wallet_address = ? AND role = 'admin'"
        )
        .bind(org_id)
        .bind(&user.wallet_address)
        .fetch_one(&state.db)
        .await?
    } else {
        0
    };

    if owner_check == 0 && admin_check == 0 {
        return Err(ApiError::Forbidden);
    }

    if query.role != "admin" && query.role != "member" {
        return Err(ApiError::BadRequest(
            "Role must be 'admin' or 'member'".to_string(),
        ));
    }

    let member = sqlx::query_as::<_, OrgMember>(
        "INSERT INTO org_members (org_id, wallet_address, role) VALUES (?, ?, ?) RETURNING org_id, wallet_address, role, created_at"
    )
    .bind(org_id)
    .bind(&wallet_address)
    .bind(&query.role)
    .fetch_one(&state.db)
    .await?;

    Ok(respond::ok("Member added to organization", member))
}

#[patch("/{id}/members")]
async fn patch_org_members_handler(
    user: AuthUser,
    path: web::Path<i64>,
    query: web::Query<PatchMemberQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let org_id = path.into_inner();

    let wallet_address = query.wallet_address.to_lowercase();

    let owner_check = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM organizations WHERE id = ? AND owner = ?",
    )
    .bind(org_id)
    .bind(&user.wallet_address)
    .fetch_one(&state.db)
    .await?;

    let admin_check = if owner_check == 0 {
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM org_members WHERE org_id = ? AND wallet_address = ? AND role = 'admin'"
        )
        .bind(org_id)
        .bind(&user.wallet_address)
        .fetch_one(&state.db)
        .await?
    } else {
        0
    };

    if owner_check == 0 && admin_check == 0 {
        return Err(ApiError::Forbidden);
    }

    let member = sqlx::query_as::<_, OrgMember>(
        "UPDATE org_members SET role = ? WHERE org_id = ? AND wallet_address = ? RETURNING org_id, wallet_address, role, created_at"
    )
    .bind(&query.role)
    .bind(org_id)
    .bind(&wallet_address)
    .fetch_one(&state.db)
    .await?;

    Ok(respond::ok("Member role updated", member))
}

#[delete("/{id}/members")]
async fn delete_org_members_handler(
    user: AuthUser,
    path: web::Path<i64>,
    query: web::Query<DeleteMemberQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let org_id = path.into_inner();

    let wallet_address = query.wallet_address.to_lowercase();

    let owner_check = sqlx::query_scalar::<_, i64>(
        "SELECT COUNT(*) FROM organizations WHERE id = ? AND owner = ?",
    )
    .bind(org_id)
    .bind(&user.wallet_address)
    .fetch_one(&state.db)
    .await?;

    let admin_check = if owner_check == 0 {
        sqlx::query_scalar::<_, i64>(
            "SELECT COUNT(*) FROM org_members WHERE org_id = ? AND wallet_address = ? AND role = 'admin'"
        )
        .bind(org_id)
        .bind(&user.wallet_address)
        .fetch_one(&state.db)
        .await?
    } else {
        0
    };

    if owner_check == 0 && admin_check == 0 {
        return Err(ApiError::Forbidden);
    }

    let member = sqlx::query_as::<_, OrgMember>(
        "DELETE FROM org_members WHERE org_id = ? AND wallet_address = ? RETURNING org_id, wallet_address, role, created_at"
    )
    .bind(org_id)
    .bind(&wallet_address)
    .fetch_one(&state.db)
    .await?;

    Ok(respond::ok("Member removed from organization", member))
}

#[get("/{id}/models")]
async fn get_org_models_handler(
    _: AuthUser,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let models = get_models();

    let enabled_models = sqlx::query_scalar::<_, String>(
        "SELECT model_id FROM org_model_enrollments WHERE org_id = ?",
    )
    .bind(org_id)
    .fetch_all(&state.db)
    .await?;

    let enabled_models = models
        .into_iter()
        .filter(|model| enabled_models.contains(&model.id) && model.is_active)
        .collect::<Vec<_>>();

    Ok(respond::ok(
        "Models fetched",
        serde_json::json!(enabled_models),
    ))
}

#[derive(Deserialize)]
struct PostOrgModelsQuery {
    model_id: i64,
}

#[post("/{id}/models")]
async fn post_org_models_handler(
    _: AuthUser,
    query: web::Query<PostOrgModelsQuery>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let models = get_models();

    let model_id = query.model_id;
    if !models.iter().any(|m| m.id == model_id) {
        return Err(ApiError::NotFound("Model not found".to_string()));
    }

    let model = models.iter().find(|m| m.id == model_id).cloned();

    sqlx::query("INSERT INTO org_model_enrollments (org_id, model_id) VALUES (?, ?)")
        .bind(org_id)
        .bind(model_id)
        .execute(&state.db)
        .await?;

    Ok(respond::ok("Models enrolled", serde_json::json!(model)))
}

#[delete("/{id}/models")]
async fn delete_org_models_handler(
    _: AuthUser,
    path: web::Path<i64>,
    state: web::Data<AppState>,
) -> Result<impl Responder, ApiError> {
    let org_id = path.into_inner();

    sqlx::query("DELETE FROM org_model_enrollments WHERE org_id = ?")
        .bind(org_id)
        .execute(&state.db)
        .await?;

    Ok(respond::ok(
        "Models unregistered",
        serde_json::json!({id : org_id}),
    ))
}

pub fn routes(cfg: &mut web::ServiceConfig) {
    cfg.service(post_index_handler)
        .service(get_org_handler)
        .service(patch_org_handler)
        .service(delete_org_handler)
        .service(get_org_members_handler)
        .service(post_org_members_handler)
        .service(patch_org_members_handler)
        .service(delete_org_members_handler)
        .service(get_org_models_handler)
        .service(post_org_models_handler);
}
