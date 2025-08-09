-- Drop tables in reverse order to handle foreign key dependencies
DROP TABLE IF EXISTS agent_preview_messages;

DROP TABLE IF EXISTS agent_preview_conversations;

DROP TABLE IF EXISTS conversations;

DROP TABLE IF EXISTS faucet_requests;

DROP TABLE IF EXISTS project_products_enabled;

DROP TABLE IF EXISTS products;

DROP TABLE IF EXISTS creators;

DROP TABLE IF EXISTS org_model_enrollments;

DROP TABLE IF EXISTS project_members;

DROP TABLE IF EXISTS projects;

DROP TABLE IF EXISTS org_members;

DROP TABLE IF EXISTS organizations;

DROP TABLE IF EXISTS sessions;

DROP TABLE IF EXISTS accounts;