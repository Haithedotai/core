
CREATE TABLE IF NOT EXISTS analytics_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_type TEXT NOT NULL, 
    org_id INTEGER,
    project_id INTEGER,
    user_wallet_address TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS idx_analytics_logs_type_time
ON analytics_logs (log_type, created_at);


CREATE INDEX IF NOT EXISTS idx_analytics_logs_org
ON analytics_logs (org_id, log_type, created_at);

 
CREATE INDEX IF NOT EXISTS idx_analytics_logs_project
ON analytics_logs (project_id, log_type, created_at);


CREATE INDEX IF NOT EXISTS idx_analytics_logs_user
ON analytics_logs (user_wallet_address, log_type, created_at);
