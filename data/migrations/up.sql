-- SQLITE MIGRATION SCRIPT --
CREATE TABLE
    IF NOT EXISTS accounts (
        wallet_address TEXT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        api_key_last_issued_at TIMESTAMP,
        UNIQUE (wallet_address)
    );

CREATE TABLE
    IF NOT EXISTS sessions (
        wallet_address TEXT PRIMARY KEY,
        token TEXT,
        ip TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS organizations (
        id INTEGER PRIMARY KEY,
        organization_uid TEXT NOT NULL,
        address TEXT NOT NULL,
        orchestrator_idx INTEGER NOT NULL,
        name TEXT NOT NULL,
        owner TEXT NOT NULL REFERENCES accounts (wallet_address) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (name),
        UNIQUE (organization_uid),
        UNIQUE (address)
    );

CREATE TABLE
    IF NOT EXISTS org_members (
        org_id INTEGER NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
        wallet_address TEXT NOT NULL REFERENCES accounts (wallet_address) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (org_id, wallet_address)
    );

CREATE TABLE
    IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY,
        project_uid TEXT NOT NULL,
        org_id INTEGER NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (name, org_id),
        UNIQUE (project_uid)
    );

CREATE TABLE
    IF NOT EXISTS project_members (
        project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
        wallet_address TEXT NOT NULL REFERENCES accounts (wallet_address) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('admin', 'developer', 'viewer')),
        PRIMARY KEY (project_id, wallet_address)
    );

CREATE TABLE
    IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        config JSON DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS api_keys (
        id INTEGER PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
        created_by TEXT NOT NULL REFERENCES accounts (wallet_address),
        name TEXT NOT NULL,
        hashed_key TEXT NOT NULL,
        scopes TEXT DEFAULT '[]',
        expires_at TIMESTAMP,
        revoked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );