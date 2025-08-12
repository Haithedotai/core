-- Add API calls tracking table for analytics
CREATE TABLE IF NOT EXISTS api_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_uid TEXT NOT NULL UNIQUE,
    project_id INTEGER NOT NULL,
    org_id INTEGER NOT NULL,
    user_wallet_address TEXT NOT NULL,
    model_used TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY(org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Add performance index for analytics queries
CREATE INDEX IF NOT EXISTS idx_api_calls_org_project_time
ON api_calls (org_id, project_id, created_at);

-- Add index for user analytics
CREATE INDEX IF NOT EXISTS idx_api_calls_user_time
ON api_calls (user_wallet_address, created_at);

-- Add index for model usage analytics
CREATE INDEX IF NOT EXISTS idx_api_calls_model_org
ON api_calls (org_id, model_used);
