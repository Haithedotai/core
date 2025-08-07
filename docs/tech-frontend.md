# Haithe Platform - Frontend Technical Guide

## Overview

The Haithe platform frontend is a modern React-based web application built with TypeScript that provides a comprehensive user interface for the decentralized AI marketplace. It features wallet-based authentication, organization management, AI agent creation, marketplace operations, and real-time chat capabilities.

## Architecture

### Technology Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Bun with custom build configuration
- **Routing**: TanStack Router for type-safe routing
- **State Management**: Zustand for global state, TanStack Query for server state
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom components
- **Web3 Integration**: Privy for wallet authentication, Wagmi for blockchain interaction
- **Development Server**: Bun with HMR and API proxy
- **Deployment**: Bun production server with static file serving

### Core Dependencies
- **@privy-io/react-auth**: Web3 authentication and wallet management
- **@tanstack/react-router**: Type-safe routing and navigation
- **@tanstack/react-query**: Server state management and caching
- **wagmi**: Ethereum blockchain interaction
- **zustand**: Lightweight state management
- **radix-ui**: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **sonner**: Toast notifications
- **motion**: Animation library

## Application Structure

### Entry Point
```typescript
// main.tsx - Application bootstrap and provider setup
```

**Provider Hierarchy**:
1. **ErrorBoundary**: Global error handling
2. **QueryClientProvider**: React Query for data fetching
3. **ThemeProvider**: Dark/light theme management
4. **PrivyProvider**: Web3 authentication
5. **WagmiProvider**: Blockchain interaction
6. **ServicesProvider**: Haithe API client
7. **RouterProvider**: Application routing

### Routing Architecture

#### Route Structure
```
/                           # Landing page
/onboarding                 # User onboarding flow
/dashboard                  # Main dashboard
├── /profile               # User profile management
├── /agents                # AI agent management
│   ├── /configuration     # Agent configuration
│   └── /chat              # Agent chat interface
├── /workflows             # Workflow management (future)
├── /analytics             # Analytics dashboard (future)
├── /purchases             # Purchase history
├── /settings              # Application settings
├── /help                  # Help and documentation
└── /generate-api-key      # API key generation
/marketplace               # Marketplace interface
├── /become-creator        # Creator registration
├── /create                # Product creation
├── /item/$id              # Product details
└── /profile               # Creator profile
```

#### Route Protection
- **Public Routes**: Landing page, marketplace browsing
- **Authenticated Routes**: Dashboard, profile, settings
- **Organization Routes**: Agent management, purchases
- **Creator Routes**: Product creation, creator profile

### State Management

#### Global State (Zustand)
```typescript
// Store structure for application-wide state
interface AppState {
  // Theme and UI state
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  
  // Marketplace state
  marketplace: {
    filters: MarketplaceFilters;
    searchQuery: string;
    viewMode: 'grid' | 'list';
    favorites: string[];
  };
  
  // Organization state
  selectedOrganization: Organization | null;
  selectedProject: Project | null;
}
```

#### Server State (TanStack Query)
- **User Profile**: Authentication and user data
- **Organizations**: User's organizations and memberships
- **Projects/Agents**: AI agent configurations and data
- **Marketplace Products**: Available products and purchases
- **Chat Conversations**: Message history and state

## Core Components

### Authentication System

#### Privy Integration
```typescript
// Web3 authentication with multiple login methods
const privyConfig = {
  defaultChain: isProd ? hyperion : hardhat,
  supportedChains: [hyperion, mainnet, hardhat],
  loginMethods: ["wallet", "google", "twitter"],
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    }
  }
};
```

#### Authentication Flow
1. **Wallet Connection**: User connects wallet via Privy
2. **Haithe Login**: Wallet signature verification with backend
3. **Token Management**: JWT token storage and refresh
4. **Session Persistence**: Local storage for authentication state

### Dashboard Architecture

#### Layout Components
- **Header**: Navigation, wallet status, organization selector
- **Sidebar**: Main navigation with collapsible sections
- **Content Area**: Dynamic content based on current route
- **Mobile Navigation**: Responsive mobile menu

#### Dashboard Sections
- **Overview**: Organization stats and quick actions
- **Agents**: AI agent management and configuration
- **Financial**: USDT balance, faucet, and expenditure tracking
- **Marketplace**: Product browsing and purchases
- **Settings**: Organization and user preferences

### Organization Management

#### Organization Selector
```typescript
// Multi-tenant organization switching
interface OrganizationSelector {
  organizations: Organization[];
  selectedOrg: Organization | null;
  onSelect: (org: Organization) => void;
  onCreate: () => void;
}
```

#### Organization Features
- **Member Management**: Add, remove, and update member roles
- **Model Management**: Enable/disable AI models for organization
- **Financial Management**: USDT balance and transfer capabilities
- **Project Management**: Create and manage AI agents

### AI Agent Management

#### Agent Configuration
```typescript
// Agent setup and configuration interface
interface AgentConfig {
  name: string;
  description: string;
  searchEnabled: boolean;
  memoryEnabled: boolean;
  pricePerCall: number;
  enabledModels: string[];
  enabledProducts: string[];
}
```

#### Agent Features
- **Model Selection**: Choose from enabled AI models
- **Product Integration**: Enable marketplace products
- **Search Configuration**: Web search capabilities
- **Memory Settings**: Conversation history retention
- **Pricing**: Cost per API call configuration

### Chat Interface

#### Chat Components
- **Conversation List**: Chat history and management
- **Chat Window**: Real-time messaging interface
- **Message Input**: Text input with AI model selection
- **Settings Panel**: Chat configuration and preferences

#### Chat Features
- **Real-time Messaging**: Live conversation with AI agents
- **Model Selection**: Choose AI model for responses
- **Temperature Control**: Adjust response creativity
- **Message History**: Persistent conversation storage
- **Export Capabilities**: Download conversation data

### Marketplace Interface

#### Product Browsing
```typescript
// Marketplace filtering and search
interface MarketplaceFilters {
  category: string[];
  priceRange: { min: number; max: number };
  sortBy: 'recent' | 'price_low' | 'price_high';
  searchQuery: string;
}
```

#### Product Categories
- **Knowledge Bases**: Text, HTML, PDF, CSV content
- **Prompt Sets**: Pre-defined prompt collections
- **RPC Tools**: External API integrations
- **MCP Tools**: Model Context Protocol tools
- **Custom Tools**: Rust, JavaScript, Python tools

#### Creator Features
- **Product Creation**: Multi-step product creation wizard
- **Creator Profile**: Public creator profile and products
- **Revenue Tracking**: Sales and earnings analytics
- **Product Management**: Edit, update, and archive products

## API Integration

### Haithe Client
```typescript
// Centralized API client for backend communication
class HaitheClient {
  // Authentication
  auth: {
    login(): Promise<void>;
    logout(): Promise<void>;
    isLoggedIn(): boolean;
  };
  
  // Organizations
  getUserOrganizations(): Promise<Organization[]>;
  createOrganization(data: CreateOrgData): Promise<Organization>;
  
  // Projects/Agents
  getProjects(): Promise<Project[]>;
  createProject(data: CreateProjectData): Promise<Project>;
  
  // Marketplace
  getAllProducts(): Promise<Product[]>;
  createProduct(data: CreateProductData): Promise<Product>;
}
```

### API Hooks
```typescript
// Custom hooks for API operations
export function useHaitheApi() {
  // Authentication
  login: useMutation();
  logout: useMutation();
  
  // Queries
  profile: () => useQuery();
  organizations: () => useQuery();
  projects: () => useQuery();
  products: () => useQuery();
  
  // Mutations
  createOrganization: useMutation();
  createProject: useMutation();
  createProduct: useMutation();
}
```

## UI/UX Design System

### Component Library
- **Base Components**: Button, Input, Card, Modal
- **Layout Components**: Header, Sidebar, Navigation
- **Data Components**: Table, List, Grid, Charts
- **Feedback Components**: Toast, Alert, Progress
- **Form Components**: Form, Field, Validation

### Design Tokens
```css
/* Color system */
--primary: #3b82f6;
--secondary: #8b5cf6;
--accent: #06b6d4;
--background: #0f0f23;
--foreground: #ffffff;
--muted: #6b7280;
--border: #374151;
```

### Responsive Design
- **Mobile First**: Progressive enhancement approach
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Container Queries**: Modern responsive patterns
- **Touch Friendly**: Mobile-optimized interactions

## Development Workflow

### Development Server
```typescript
// dev.ts - Development server with HMR and API proxy
const server = serve({
  development: {
    hmr: true,
    console: true,
  },
  routes: {
    "/api/v1/*": hono.fetch,  // API proxy
    "/static/*": staticFiles,  // Static assets
    "/*": html,               // SPA routing
  }
});
```

### Build Process
```typescript
// build.ts - Production build configuration
const buildConfig = {
  entrypoints: ["src/main.tsx"],
  outdir: "dist",
  minify: true,
  sourcemap: "linked",
  target: "browser",
  format: "esm",
  plugins: [tailwindPlugin],
};
```

### Environment Configuration
```typescript
// env.ts - Environment variable management
const env = {
  PORT: process.env.PORT || "3000",
  BUN_PUBLIC_PRIVY_APP_ID: process.env.BUN_PUBLIC_PRIVY_APP_ID,
  BUN_PUBLIC_RUST_SERVER_URL: process.env.BUN_PUBLIC_RUST_SERVER_URL,
  NODE_ENV: process.env.NODE_ENV || "development",
};
```

## Performance Optimization

### Code Splitting
- **Route-based Splitting**: Automatic code splitting by routes
- **Component Lazy Loading**: Dynamic imports for heavy components
- **Bundle Analysis**: Build-time bundle size monitoring

### Caching Strategy
- **Query Caching**: TanStack Query for API response caching
- **Static Assets**: Long-term caching for static files
- **Service Worker**: Offline support and caching (future)

### Performance Monitoring
- **Bundle Analysis**: Build-time performance metrics
- **Runtime Monitoring**: User experience metrics
- **Error Tracking**: Global error boundary and reporting

## Security Features

### Authentication Security
- **Wallet Verification**: Cryptographic signature validation
- **Token Management**: Secure JWT token handling
- **Session Security**: Automatic token refresh and validation

### Data Protection
- **Input Validation**: Client-side and server-side validation
- **XSS Prevention**: Content Security Policy and sanitization
- **CSRF Protection**: Token-based request validation

### Privacy Features
- **Data Minimization**: Only collect necessary user data
- **Local Storage**: Secure client-side data storage
- **Encryption**: Sensitive data encryption in transit

## Testing Strategy

### Testing Framework
- **Unit Testing**: Component and utility testing
- **Integration Testing**: API integration testing
- **E2E Testing**: User workflow testing (future)

### Testing Tools
- **Vitest**: Fast unit testing
- **React Testing Library**: Component testing
- **MSW**: API mocking and testing

## Deployment Architecture

### Production Server
```typescript
// prod.ts - Production server configuration
const server = serve({
  development: false,
  routes: {
    "/api/v1/*": hono.fetch,  // API routes
    "/*": staticFiles,        // Static file serving
  }
});
```

### Static File Serving
- **SPA Routing**: Client-side routing support
- **Asset Optimization**: Compressed and cached static assets
- **CDN Ready**: Static asset delivery optimization

### Environment Management
- **Environment Variables**: Runtime configuration
- **Feature Flags**: Gradual feature rollout
- **Monitoring**: Application health monitoring

## Integration Points

### Backend Integration
- **REST API**: Full REST API integration
- **WebSocket**: Real-time chat capabilities
- **File Upload**: Product content upload

### Blockchain Integration
- **Smart Contracts**: Direct contract interaction
- **Transaction Management**: USDT transfers and payments
- **Event Listening**: Blockchain event monitoring

### External Services
- **IPFS**: Decentralized file storage
- **AI Providers**: Multiple AI model integration
- **Payment Processing**: USDT payment handling

## Monitoring and Analytics

### User Analytics
- **Page Views**: Route-based analytics
- **User Behavior**: Interaction tracking
- **Performance Metrics**: Load times and errors

### Error Monitoring
- **Error Boundaries**: React error boundary implementation
- **Error Reporting**: Centralized error collection
- **Performance Monitoring**: Real user monitoring

### Health Checks
- **API Health**: Backend service monitoring
- **Blockchain Health**: Network connectivity monitoring
- **User Experience**: Core Web Vitals tracking

This technical guide provides a comprehensive overview of the Haithe platform's frontend architecture, focusing on the logical structure and functionality without being tied to specific programming languages or frameworks. 