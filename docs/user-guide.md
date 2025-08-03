# Haithe Platform How-To Guide

## About Haithe

**Haithe** is a comprehensive AI platform that combines Web3 blockchain technology with advanced AI capabilities to create a decentralized ecosystem for AI development and deployment. 

### What Haithe Does

**Core Platform Features:**
- **AI Agent Management**: Create, configure, and deploy AI agents with custom capabilities
- **Web3 Integration**: Blockchain-based authentication, payments, and decentralized marketplace
- **Organization Management**: Multi-tenant workspace with role-based access control
- **AI Model Orchestration**: Enable and manage various AI models for your projects
- **Marketplace Ecosystem**: Buy, sell, and share AI products (knowledge bases, tools, prompt sets)
- **Financial Management**: USDT-based payments, faucet system, and expenditure tracking

**Key Capabilities:**
- **Decentralized AI Development**: Build AI applications using blockchain-secured infrastructure
- **Marketplace Economy**: Monetize AI products and access community-created resources
- **Team Collaboration**: Multi-member organizations with granular permissions
- **API Access**: Programmatic access to all platform features
- **Real-time Chat**: Interactive AI conversations with configurable models and products

---

## Navigation Guide

### Main Navigation
- **Header**: Connect Wallet, Profile Menu, Organization Selector
- **Sidebar**: Dashboard, Agents, Analytics (soon), Help, Profile, Purchases, Settings, Workflows (soon)

### Feature Locations
- **Auth**: Header → Connect Wallet, Header → Wallet Address → Profile/Logout
- **Orgs**: Dashboard → Create Org, Dashboard → Org Selector → Settings → Members/Balance
- **Projects/Agents**: Dashboard → Create Project, Dashboard → Project → Configuration → Members/Products
- **AI Models**: Org Settings → Models → Enable/Disable, Project Config → Models
- **Financial**: Dashboard → Financial → Balance/Faucet/Transfer, Org Settings → Financial
- **Marketplace**: Top Nav → Marketplace → Browse/Create/Become Creator/Profile
- **Chat**: Dashboard → Agents → Agent → Chat → New Conversation/Settings
- **API Keys**: Dashboard → Generate API Key, Profile → Settings → API Keys
- **Products**: Dashboard → Purchases → View/Disable, Project Config → Products
- **Analytics**: Dashboard → Analytics (soon)
- **Workflows**: Dashboard → Workflows (soon)

### Quick Access
- **Common**: Header → Org Dropdown, Dashboard → Create Project, Dashboard → Agents → Agent → Chat, Dashboard → Financial, Top Nav → Marketplace
- **Settings**: Header → Wallet → Profile, Dashboard → Org → Settings, Dashboard → Project → Config, Dashboard → Agent → Config
- **Help**: Dashboard → Help → Guides/Support

---

## Getting Started

### First Time Setup
1. Visit platform homepage
2. Click "Connect Wallet" → Select wallet → Approve signature
3. Complete onboarding: Welcome → Create Organization → Add Members (optional) → Set Roles → Confirm

---

## Authentication & Wallet Setup

### Connecting Wallet
1. Click "Connect Wallet" in header
2. Select wallet (MetaMask, WalletConnect, etc.)
3. Approve connection in wallet
4. Verify wallet address appears in header

### Session Management
1. Click wallet address in header → Profile/Settings
2. Update profile details as needed
3. Logout: Header → Wallet Address → Logout

---

## Organization Management

### Creating Organization
1. Dashboard → "Create Organization"
2. Enter name and description (optional)
3. Click "Create" → Set as active workspace

### Managing Members
1. Org Settings → Members
2. Add: Click "Add Member" → Enter wallet address → Select role (admin/member) → Add
3. Update: Find member → Click role dropdown → Select new role → Save
4. Remove: Find member → Click "Remove" → Confirm

### Organization Settings
1. Org Settings → Update name/description
2. Financial: View USDT balance, expenditure reports, billing

---

## Project/Agent Management

### Creating Projects/Agents
1. Dashboard → "Create Project"
2. Enter name, description, enable/disable search/memory
3. Click "Create" → Access project workspace

### Managing Members
1. Project Settings → Members
2. Add: Click "Add Member" → Enter wallet address → Select role (admin/developer/viewer) → Add
3. Update: Find member → Click role dropdown → Select new role → Save
4. Remove: Find member → Click "Remove" → Confirm

### Configuration
1. Project Settings → Configure search/memory, set price per call
2. Models: Enable/disable AI models, configure parameters
3. Products: Connect marketplace products, configure settings
4. Save changes

---

## AI Model Management

### Enabling Models
1. Org Settings → Models → Browse available models
2. Click "Enable" → Confirm → Configure limits/parameters/pricing (if applicable)

### Managing Models
1. View enabled models in Org Settings → Models
2. Disable: Find model → Click "Disable" → Confirm
3. Update: Modify parameters, limits, pricing

### Using AI Completions
1. Project chat interface → Select enabled model
2. Configure temperature, response count, parameters
3. Send message → View AI response

---

## Financial Management

### Balance & Expenditure
1. Dashboard → Financial or Org Settings → View USDT balance
2. Check expenditure reports, monitor usage costs

### Faucet Tokens
1. Dashboard → Faucet or Financial → Check eligibility
2. Select product (if applicable) → Click "Request Tokens" → Wait for confirmation

### Transferring USDT
1. Financial → Transfer → Enter recipient address and amount
2. Confirm transaction → Approve in wallet → Wait for blockchain confirmation

---

## Marketplace Usage

### Becoming Creator
1. Marketplace → "Become Creator" → Enter name, description, profile image (optional)
2. Click "Register as Creator" → Wait for approval

### Creating Products
1. Marketplace → Create → Select type:
   - **Knowledge Base**: Text, HTML, PDF, CSV, URL content
   - **Prompt Set**: Pre-defined prompt collections
   - **RPC Tool**: Custom API integrations (HTTP methods, URL, headers, parameters)
   - **MCP Tool**: Model Context Protocol tools (soon)
   - **Custom Tools**: Rust, JavaScript, Python tools (soon)
2. Fill details: name, description, category-specific content
3. Set price per call in USDT → Click "Publish"

### RPC Tool Creation
1. Select "RPC Tool" → Define: name, description, HTTP method (GET/POST/PUT/DELETE), URL, parameter style
2. Add headers (optional): Click "Add Header" → Enter key/value
3. Define parameters: Click "Add Parameter" → Set name, type (string/number/boolean/object/array), description, required status
4. Set pricing → Publish

### Browsing & Purchasing
1. Marketplace → Browse → Filter by type/status
2. View product details → Click "Enable for Organization" → Select org → Confirm
3. Enable for project: Project Settings → Products → Find product → "Enable for Project"

---

## Chat & Conversations

### Managing Conversations
1. Project/Agent chat → "New Conversation" → Enter title → Start chatting
2. View conversation list in sidebar → Switch conversations
3. Update: Click settings → Modify title/details → Save
4. Delete: Click settings → "Delete" → Confirm

### Sending Messages
1. Select conversation → Type message
2. Configure AI settings (model, temperature, parameters) if using AI
3. Send message → View response

---

## API Key Management

### Generating & Managing Keys
1. Dashboard → Generate API Key or Profile → Settings → API Keys
2. Click "Generate" → Copy key immediately → Store securely
3. View active keys, check last issued date
4. Disable: Find key → "Disable" → Confirm
5. Generate new key if needed

### Using API Keys
1. Include in request headers: `Authorization: Bearer YOUR_API_KEY`
2. Make authenticated API calls → Monitor usage/limits

---

## Profile & Settings

### Profile Management
1. Header → Wallet Address → Profile → Edit name/picture/bio → Save

### Settings
1. Profile → Settings → General (language, theme, notifications), Security (API keys, session, privacy), Organization (default org, permissions, billing)

### Help & Support
1. Dashboard → Help → Browse guides, contact support, report issues

---

## Purchases & Product Management

### Managing Products
1. Dashboard → Purchases → View enabled products for organization
2. Filter by name, category (Knowledge, Tools), status (active/inactive)
3. View financial info: USDT balance, expenditure, usage costs
4. Disable: Find product → "Disable" → Confirm → Re-enable if needed

### Product Categories
- **Knowledge Bases**: Text, HTML, PDF, CSV, URL content
- **Prompt Sets**: Pre-defined prompt collections
- **RPC Tools**: Custom API integrations
- **MCP Tools**: Model Context Protocol tools (soon)
- **Custom Tools**: Rust, JavaScript, Python tools (soon)

---

## Analytics & Insights

### Accessing Analytics
1. Dashboard → Analytics → View performance metrics, monitor trends, export reports
*Note: Under development, coming soon*

---

## Workflows

### Creating & Managing Workflows
1. Dashboard → Workflows → Design complex AI workflows with multiple agents
2. Configure steps, define triggers, test and deploy
3. View workflow list, edit configurations, monitor execution, archive workflows
*Note: Under development, coming soon*

---

## Troubleshooting

### Common Issues
- **Wallet Connection**: Ensure wallet unlocked, correct network, refresh page
- **Transaction Failures**: Check USDT balance, gas fees, correct blockchain network
- **API Key Issues**: Verify key correct/active, check expiration, proper headers
- **Model Access**: Confirm model enabled for org, sufficient balance, project permissions

### Support
1. Check this documentation
2. Community forums/Discord
3. Contact development team
4. Submit detailed bug reports

---

*Complete Haithe platform guide - all features covered with step-by-step instructions.* 