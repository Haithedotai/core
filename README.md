# Haithe

Build, Deploy & Monetize AI Agents on Blockchain.

## Overview

**Haithe** is a comprehensive AI platform that combines Web3 blockchain technology with advanced AI capabilities to create a decentralized ecosystem for AI development and deployment. Build, deploy, and monetize AI agents in a secure, blockchain-powered marketplace.

## 🚀 Key Features

### AI Agent Management
- Create, configure, and deploy AI agents with custom capabilities
- Real-time chat interface with configurable AI models
- Memory and search capabilities for context-aware conversations
- Multi-model orchestration (OpenAI, Anthropic, and more)

### Web3 Integration
- Wallet-based authentication (MetaMask, WalletConnect, etc.)
- Blockchain-secured payments with USDT
- Decentralized marketplace for AI products
- NFT-based creator identities

### Organization Management
- Multi-tenant workspace with role-based access control
- Team collaboration with granular permissions
- Financial management and expenditure tracking
- API access for programmatic integration

### Marketplace Ecosystem
- Buy, sell, and share AI products (knowledge bases, tools, prompt sets)
- Creator monetization with revenue sharing
- Product discovery and rating system
- Secure payment processing

## 🏗️ Architecture

### Frontend
- **React 19** with TypeScript
- **TanStack Router** for type-safe routing
- **Zustand** for state management
- **Tailwind CSS** with Radix UI components
- **Privy** for Web3 authentication
- **Wagmi** for blockchain interaction

### Backend
- **Rust** with Actix Web framework
- **SQLite** database with SQLx
- **JWT** authentication with wallet signature verification
- **Ethers.rs** for Ethereum smart contract interaction
- **Custom AI orchestration** with multiple providers

### Smart Contracts
- **HaitheOrchestrator**: Central coordination contract
- **HaitheOrganization**: Multi-tenant workspace management
- **HaitheProduct**: Marketplace product representation
- **HaitheCreatorIdentity**: NFT-based creator identity
- **tUSDT**: Test USDT token for development

## 🛠️ Technology Stack

### Core Dependencies
- **Frontend**: React, TypeScript, Bun, TanStack Router, Zustand, Tailwind CSS
- **Backend**: Rust, Actix Web, SQLx, Ethers.rs, JWT
- **Blockchain**: Solidity, OpenZeppelin Contracts, Viem
- **AI**: Custom orchestration with OpenAI, Anthropic, and other providers

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Rust toolchain
- MetaMask or compatible Web3 wallet
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd haithe
   ```

2. **Set up the backend**
   ```bash
   cd backend
   cargo build
   cargo run
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   bun install
   bun dev
   ```

4. **Connect your wallet**
   - Visit the platform homepage
   - Click "Connect Wallet" and approve the connection
   - Complete the onboarding flow

### First Time Setup
1. Create an organization
2. Add team members (optional)
3. Configure AI models
4. Create your first AI agent
5. Start building and monetizing AI products

## 📚 Documentation

- **[User Guide](docs/user-guide.md)** - Complete platform usage guide
- **[Frontend Technical Guide](docs/tech-frontend.md)** - React/TypeScript implementation details
- **[Backend Technical Guide](docs/tech-rust.md)** - Rust server architecture
- **[Smart Contracts Guide](docs/tech-contracts.md)** - Blockchain contract specifications

## 🔧 Development

### Project Structure
```
haithe/
├── frontend/          # React TypeScript application
├── backend/           # Rust Actix Web server
├── contracts/         # Solidity smart contracts
└── docs/             # Documentation
```

### API Endpoints
- **Authentication**: `/api/v1/auth/*`
- **Organizations**: `/api/v1/orgs/*`
- **Projects/Agents**: `/api/v1/projects/*`
- **Marketplace**: `/api/v1/creator/*`, `/api/v1/products/*`
- **AI Models**: `/api/v1/models/*`
- **OpenAI Compatible**: `/api/v1beta/openai/*`

## 🌐 Networks

- **Development**: Hardhat Network (local)
- **Testnet**: Hyperion Testnet (Metis)
- **Production**: Configurable for mainnet

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

[Add your license information here]

## 🆘 Support

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Community**: Join our community channels

---

**Haithe** - Empowering the future of decentralized AI development.
