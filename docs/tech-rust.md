# Haithe Platform - Backend Server Technical Guide

## Overview

The Haithe platform backend server is a Rust-based API service built with Actix Web that provides the core business logic for the decentralized AI marketplace. It handles authentication, organization management, AI model orchestration, blockchain integration, and marketplace operations.

## Architecture

### Technology Stack
- **Framework**: Actix Web 4.9.0 (async web framework)
- **Database**: SQLite with SQLx for async database operations
- **Authentication**: JWT tokens with wallet signature verification
- **Blockchain**: Ethers.rs for Ethereum smart contract interaction
- **AI Integration**: Custom AI model orchestration with multiple providers
- **CORS**: Cross-origin resource sharing support
- **Serialization**: Serde for JSON handling

### Core Dependencies
- **alith**: AI orchestration library with crypto, IPFS, and wallet features
- **ethers**: Ethereum blockchain interaction
- **sqlx**: Async database operations
- **jsonwebtoken**: JWT token generation and validation
- **secp256k1**: Cryptographic signature verification
- **chrono**: Date and time handling
- **uuid**: Unique identifier generation

## Server Structure

### Main Application Entry Point
```rust
// main.rs - Server initialization and configuration
```

**Key Components**:
- **Database Setup**: SQLite connection with automatic migration
- **CORS Configuration**: Cross-origin support for web frontend
- **State Management**: Global application state with thread-safe data structures
- **Route Configuration**: API endpoint registration
- **Health Check**: `/health` endpoint for monitoring

### Application State
```rust
pub struct AppState {
    pub nonce_registry: Mutex<HashMap<String, String>>,
    pub db: SqlitePool,
    pub window_buffer_memory: Mutex<HashMap<String, WindowBufferMemory>>,
}
```

**State Components**:
- **Nonce Registry**: Thread-safe storage for authentication nonces
- **Database Pool**: Connection pool for SQLite operations
- **Window Buffer Memory**: AI conversation memory management

## API Architecture

### Route Structure
```
/api/
├── v1/                    # Stable API endpoints
│   ├── auth/             # Authentication endpoints
│   ├── me/               # User profile management
│   ├── models/           # AI model management
│   ├── orgs/             # Organization management
│   ├── projects/         # Project/Agent management
│   ├── creator/          # Creator marketplace operations
│   ├── products/         # Product marketplace operations
│   └── tee/              # Trusted Execution Environment
└── v1beta/               # Beta API endpoints
    ├── openai/           # OpenAI-compatible API
    ├── chat/             # Chat completion endpoints
    └── webhook/          # Webhook handlers
```

### Authentication System

#### Wallet-Based Authentication
```rust
// Two-step authentication process:
// 1. Get nonce for wallet address
// 2. Sign nonce and submit for JWT token
```

**Authentication Flow**:
1. **Nonce Generation**: Client requests nonce for wallet address
2. **Signature Verification**: Client signs nonce with wallet private key
3. **Token Generation**: Server verifies signature and issues JWT token
4. **Session Management**: Token stored in database with IP and user agent

#### API Key Authentication
```rust
// Alternative authentication for programmatic access
// Format: sk-{address}.{nonce}.{signature}
```

**API Key Components**:
- **Address**: Wallet address (hex format)
- **Nonce**: Unique challenge string
- **Signature**: Cryptographic signature of nonce

### Request Extractors

#### AuthUser Extractor
```rust
// Extracts authenticated user from JWT token
pub struct AuthUser {
    pub wallet_address: String,
    pub created_at: String,
}
```

**Validation Process**:
1. Extract JWT token from Authorization header
2. Decode and validate token
3. Verify token exists in database sessions
4. Return user information

#### ApiCaller Extractor
```rust
// Extracts authenticated user with organization/project context
pub struct ApiCaller {
    pub wallet_address: String,
    pub org_uid: String,
    pub project_uid: String,
}
```

**Context Headers**:
- **Haithe-Organization**: Organization identifier
- **Haithe-Project**: Project identifier
- **OpenAI-Organization**: OpenAI-compatible organization header
- **OpenAI-Project**: OpenAI-compatible project header

**Permission Validation**:
1. Verify JWT authentication
2. Check organization membership and role
3. Check project membership and role
4. Return caller context with permissions

## Core API Endpoints

### Authentication Endpoints (`/api/v1/auth`)

#### Nonce Generation
```
GET /api/v1/auth/nonce?address={wallet_address}
```
- **Purpose**: Generate authentication challenge
- **Response**: Unique nonce for signature
- **Security**: Nonce stored in memory registry

#### Login
```
POST /api/v1/auth/login
Body: { address, signature }
```
- **Purpose**: Authenticate wallet signature
- **Process**: Verify signature against stored nonce
- **Response**: JWT token and user information

#### Logout
```
POST /api/v1/auth/logout
Headers: Authorization: Bearer {token}
```
- **Purpose**: Invalidate session
- **Process**: Remove token from database sessions

### Organization Management (`/api/v1/orgs`)

#### Organization Operations
- **Create Organization**: Deploy smart contract and create database record
- **List Organizations**: Get user's organizations with membership details
- **Organization Details**: Get organization information and settings
- **Member Management**: Add, update, and remove organization members
- **Financial Operations**: Balance checking and USDT transfers

#### Smart Contract Integration
```rust
// Organization creation deploys HaitheOrganization contract
// Member management updates on-chain permissions
// Financial operations interact with USDT token contract
```

### Project/Agent Management (`/api/v1/projects`)

#### Project Operations
- **Create Project**: Create AI agent with configuration
- **Project Configuration**: Set search, memory, and model settings
- **Member Management**: Add developers and viewers to projects
- **Product Integration**: Enable marketplace products for projects

#### AI Configuration
- **Search Settings**: Enable/disable web search capabilities
- **Memory Settings**: Configure conversation memory retention
- **Model Selection**: Choose enabled AI models for organization
- **Pricing**: Set cost per API call

### Marketplace Operations

#### Creator Management (`/api/v1/creator`)
- **Creator Registration**: Register as marketplace creator
- **Product Creation**: Create and publish marketplace products
- **Revenue Management**: Track and withdraw creator earnings

#### Product Management (`/api/v1/products`)
- **Product Browsing**: List available marketplace products
- **Product Details**: Get product information and pricing
- **Product Enablement**: Enable products for organizations/projects
- **Product Categories**: Knowledge bases, prompt sets, RPC tools

### AI Model Management (`/api/v1/models`)

#### Model Configuration
```rust
// Supported AI Providers:
// - Google (Gemini models)
// - OpenAI (GPT models)
// - DeepSeek
// - Moonshot
// - Haithe (custom models)
```

#### Model Operations
- **Model Listing**: Get available AI models with pricing
- **Model Enablement**: Enable models for organizations
- **Model Resolution**: Map model names to provider configurations

### OpenAI-Compatible API (`/api/v1beta/openai`)

#### Chat Completions
```
POST /api/v1beta/openai/chat/completions
```
- **Compatibility**: OpenAI API format support
- **Features**: Model selection, temperature, response count
- **Integration**: Organization/project context and permissions
- **Tools**: RPC tool integration for external API calls

#### Model Information
```
GET /api/v1beta/openai/models
```
- **Response**: Available models in OpenAI format
- **Filtering**: Only enabled models for organization

## Database Schema

### Core Tables

#### Accounts
```sql
-- User wallet addresses and creation timestamps
CREATE TABLE accounts (
    wallet_address TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Sessions
```sql
-- Active user sessions with tokens
CREATE TABLE sessions (
    wallet_address TEXT PRIMARY KEY,
    token TEXT NOT NULL,
    ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Organizations
```sql
-- Organization information and blockchain addresses
CREATE TABLE organizations (
    id INTEGER PRIMARY KEY,
    organization_uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    owner TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Projects
```sql
-- AI agent/project configuration
CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    project_uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    org_id INTEGER NOT NULL,
    search_enabled BOOLEAN DEFAULT FALSE,
    memory_enabled BOOLEAN DEFAULT FALSE,
    price_per_call INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Relationship Tables

#### Organization Members
```sql
-- Organization membership and roles
CREATE TABLE org_members (
    org_id INTEGER NOT NULL,
    wallet_address TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (org_id, wallet_address)
);
```

#### Project Members
```sql
-- Project membership and roles
CREATE TABLE project_members (
    project_id INTEGER NOT NULL,
    wallet_address TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, wallet_address)
);
```

#### Model Enrollments
```sql
-- Organization AI model access
CREATE TABLE org_model_enrollments (
    org_id INTEGER NOT NULL,
    model_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (org_id, model_id)
);
```

## Blockchain Integration

### Smart Contract Interaction

#### Contract Management
```rust
// Contract abstraction layer
pub fn get_contract(name: &str, address: Option<&str>) -> Result<Contract<Provider<Http>>, Error>
pub fn get_contract_with_wallet(name: &str, address: Option<&str>) -> Result<Contract<SignerMiddleware<Provider<Http>, LocalWallet>>, Error>
```

#### Supported Contracts
- **HaitheOrchestrator**: Main platform coordination
- **HaitheOrganization**: Organization management
- **HaitheProduct**: Marketplace products
- **tUSDT**: Payment token

#### Contract Operations
- **Organization Creation**: Deploy new organization contracts
- **Product Registration**: Register marketplace products
- **Payment Processing**: Handle USDT transfers for AI calls
- **Creator Management**: Register creators and track revenue

### Transaction Management
- **Gas Estimation**: Automatic gas cost calculation
- **Transaction Signing**: Server-side transaction signing
- **Receipt Monitoring**: Transaction confirmation tracking
- **Error Handling**: Comprehensive blockchain error management

## AI Model Orchestration

### Model Resolution
```rust
// Dynamic model configuration based on provider
pub fn resolve_model(name: &str) -> LLM {
    // Map model name to provider configuration
    // Initialize provider-specific client
    // Return configured LLM instance
}
```

### Provider Integration

#### Google (Gemini)
- **Base URL**: `https://generativelanguage.googleapis.com/v1beta/openai`
- **API Key**: `GEMINI_API_KEY` environment variable
- **Models**: Gemini 2.0 Flash, Gemini 2.5 Pro, etc.

#### OpenAI
- **Base URL**: `https://api.openai.com/v1`
- **API Key**: `OPENAI_API_KEY` environment variable
- **Models**: GPT-4, GPT-3.5, etc.

#### DeepSeek
- **Base URL**: `https://api.deepseek.com/v1`
- **API Key**: `DEEPSEEK_API_KEY` environment variable
- **Models**: DeepSeek Chat, DeepSeek Reasoner

### Tool Integration

#### RPC Tools
```rust
// External API integration
pub struct RpcTool {
    // HTTP method, URL, parameters
    // Dynamic parameter injection
    // Response formatting
}
```

#### Knowledge Bases
- **Text Knowledge**: Plain text content
- **HTML Knowledge**: Web page content
- **PDF Knowledge**: Document content
- **CSV Knowledge**: Tabular data

#### Search Tools
- **Web Search**: Real-time web search integration
- **Memory Search**: Conversation history search
- **Product Search**: Marketplace product search

## Security Architecture

### Authentication Security
- **Nonce Validation**: Time-limited authentication challenges
- **Signature Verification**: Cryptographic signature validation
- **JWT Expiration**: 3-day token expiration
- **Session Tracking**: IP and user agent logging

### Authorization Security
- **Role-Based Access**: Owner, admin, developer, viewer roles
- **Organization Isolation**: Cross-organization access prevention
- **Project Isolation**: Cross-project access prevention
- **API Key Validation**: Cryptographic API key verification

### Data Security
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: Output sanitization
- **CORS Configuration**: Controlled cross-origin access

### Blockchain Security
- **Private Key Management**: Secure server key storage
- **Transaction Validation**: Comprehensive transaction verification
- **Gas Limit Protection**: Gas cost validation
- **Contract Address Validation**: Address format verification

## Error Handling

### Error Types
```rust
pub enum ApiError {
    BadRequest(String),
    Unauthorized,
    Forbidden,
    NotFound,
    Internal(String),
    Database(sqlx::Error),
    Blockchain(Box<dyn std::error::Error>),
}
```

### Error Responses
- **Consistent Format**: Standardized error response structure
- **HTTP Status Codes**: Appropriate HTTP status codes
- **Error Messages**: User-friendly error descriptions
- **Logging**: Comprehensive error logging for debugging

## Performance Optimization

### Database Optimization
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Optimized SQL queries with indexes
- **Async Operations**: Non-blocking database operations
- **Caching**: Strategic data caching for frequently accessed data

### Memory Management
- **Thread-Safe Structures**: Mutex-protected shared state
- **Efficient Serialization**: Optimized JSON serialization
- **Memory Pooling**: Reusable memory allocation
- **Garbage Collection**: Automatic memory cleanup

### Concurrency
- **Async/Await**: Non-blocking I/O operations
- **Thread Pool**: Efficient thread management
- **Connection Limits**: Controlled concurrent connections
- **Rate Limiting**: API rate limiting protection

## Monitoring and Observability

### Health Checks
- **Health Endpoint**: `/health` for service monitoring
- **Database Connectivity**: Database connection verification
- **Blockchain Connectivity**: Blockchain network connectivity
- **External Service Health**: AI provider connectivity

### Logging
- **Request Logging**: Comprehensive request/response logging
- **Error Logging**: Detailed error logging with context
- **Performance Logging**: Response time and resource usage
- **Security Logging**: Authentication and authorization events

### Metrics
- **Request Counts**: API endpoint usage statistics
- **Response Times**: Performance monitoring
- **Error Rates**: Error frequency tracking
- **Resource Usage**: Memory and CPU utilization

## Deployment Configuration

### Environment Variables
- **DATABASE_URL**: SQLite database connection string
- **JWT_SECRET**: JWT token signing secret
- **SERVER_PVT_KEY**: Blockchain transaction signing key
- **BLOCKCHAIN_PROVIDER_URL**: Ethereum RPC endpoint
- **PORT**: Server listening port (default: 8080)

### AI Provider Keys
- **OPENAI_API_KEY**: OpenAI API access key
- **GEMINI_API_KEY**: Google Gemini API key
- **DEEPSEEK_API_KEY**: DeepSeek API key
- **MOONSHOT_API_KEY**: Moonshot API key

### Network Configuration
- **CORS Settings**: Cross-origin resource sharing
- **Allowed Headers**: Custom header support
- **Allowed Methods**: HTTP method restrictions
- **Credentials Support**: Cookie and authentication header support

This technical guide provides a comprehensive overview of the Haithe platform's backend server architecture, focusing on the logical structure and functionality without being tied to specific programming languages or frameworks. 