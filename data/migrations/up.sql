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
        expenditure INTEGER NOT NULL DEFAULT 0 CHECK (expenditure >= 0),
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
    IF NOT EXISTS org_model_enrollments (
        id UUID PRIMARY KEY,
        org_id INTEGER NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
        model_id INTEGER NOT NULL,
        enabled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (org_id, model_id)
    );

CREATE TABLE
    IF NOT EXISTS creators (
        wallet_address TEXT PRIMARY KEY,
        uri TEXT NOT NULL,
        pvt_key_seed TEXT NOT NULL,
        pub_key TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wallet_address) REFERENCES accounts (wallet_address)
    );

CREATE TABLE
    IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT NOT NULL,
        orchestrator_idx INTEGER NOT NULL,
        creator TEXT NOT NULL REFERENCES creators (wallet_address) ON DELETE CASCADE,
        name TEXT NOT NULL,
        uri TEXT NOT NULL,
        encrypted_key TEXT NOT NULL,
        category TEXT NOT NULL,
        price_per_call INTEGER NOT NULL CHECK (price_per_call >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (name, creator)
    );

CREATE TABLE
    IF NOT EXISTS project_products_enabled (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
        enabled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (project_id, product_id)
    );

CREATE TABLE
    IF NOT EXISTS faucet_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT NOT NULL REFERENCES accounts (wallet_address) ON DELETE CASCADE,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    );

CREATE TABLE
    IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT NOT NULL REFERENCES accounts (wallet_address) ON DELETE CASCADE,
        title TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS agent_preview_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_address TEXT NOT NULL REFERENCES accounts (wallet_address) ON DELETE CASCADE,
        title TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS agent_preview_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER REFERENCES conversations (id) ON DELETE CASCADE,
        sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );