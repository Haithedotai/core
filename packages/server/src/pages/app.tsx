import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import { withProtectedRoute } from "@/src/lib/components/app/ProtectedRoute";
import { useAnalytics } from '../lib/hooks/use-analytics';
import Onboarding from './onboarding';
import Dashboard from './dashboard';
import Profile from './dashboard/profile';
import Agents from './dashboard/agents';
import Workflows from './dashboard/workflows';
import Analytics from './dashboard/analytics';
import Purchases from './dashboard/purchases';
import Help from './dashboard/help';
import Landing from './landing';
import Test from './test/test';
import Marketplace from './marketplace';
import Settings from './dashboard/settings';
import BecomeCreator from './marketplace/become-creator';
import Create from './marketplace/create';
import ItemDetailPage from './marketplace/item/itemDetailPage';
import MarketplaceProfilePage from './marketplace/profile';
import { useHaitheApi } from '../lib/hooks/use-haithe-api';
import Loader from '../lib/components/app/Loader';
import AgentsConfiguration from './dashboard/agents/configuration';
import GenerateAPIKey from './dashboard/generateAPIKey';
import { ChatWithAgent, ChatList, ChatSettings } from './dashboard/agents/chat';
import Docs from './docs';

const rootRoute = createRootRoute({
  component: () => {
    useAnalytics();
    const { isWeb3Ready, isClientInitialized } = useHaitheApi();

    if (!isWeb3Ready || !isClientInitialized) {
      return <Loader />;
    }

    return (
      <div>
        <Outlet />
      </div>
    )
  },
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    return withPageErrorBoundary(Landing)({});
  },
})

// onboarding route
const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: function OnboardingRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(Onboarding, {
        walletConnected: true,
        signedInToHaithe: true,
      })
    )({});
  },
})

// dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: function DashboardRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(Dashboard, {
        walletConnected: true,
        signedInToHaithe: true,
        hasOrg: true,
        hasProfile: true
      })
    )({});
  },
})

// profile route
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/profile',
  component: function ProfileRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(Profile, {
        walletConnected: true,
        signedInToHaithe: true,
        hasOrg: true,
        hasProfile: true
      })
    )({});
  },
})

// agents route
const agentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/agents',
  component: function AgentsRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(Agents, {
        walletConnected: true,
        signedInToHaithe: true,
        hasOrg: true
      })
    )({});
  },
})

// agents configuration route
const agentsConfigurationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/agents/$id',
  component: function AgentsConfigurationRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(AgentsConfiguration, {
        walletConnected: true,
        signedInToHaithe: true,
        hasOrg: true
      })
    )({});
  },
})

// workflows route
const workflowsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/workflows',
  component: function WorkflowsRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(Workflows, {
        walletConnected: true,
        signedInToHaithe: true,
        hasOrg: true
      })
    )({});
  },
})

// analytics route
const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/analytics',
  component: function AnalyticsRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(Analytics, {
        walletConnected: true,
        signedInToHaithe: true,
        hasOrg: true
      })
    )({});
  },
})

// purchases route
const purchasesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/purchases',
  component: function PurchasesRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(Purchases, {
        walletConnected: true,
        signedInToHaithe: true,
        hasOrg: true
      })
    )({});
  },
})

// organization route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/settings',
  component: function SettingsRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(Settings, {
        walletConnected: true,
        signedInToHaithe: true,
        hasOrg: true
      })
    )({});
  },
})

// help route
const helpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/help',
  component: function HelpRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(Help, {
        walletConnected: true,
        signedInToHaithe: true,
        hasOrg: true
      })
    )({});
  },
})

const testRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/test',
  component: function TestRoute() {
    return withPageErrorBoundary(Test)({});
  },
})

// marketplace route
const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace',
  component: function MarketplaceRoute() {
    return withPageErrorBoundary(Marketplace)({});
  },
})

const becomeCreatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace/become-a-creator',
  component: function BecomeCreatorRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(BecomeCreator, {
        walletConnected: true,
        signedInToHaithe: true,
      })
    )({});
  },
})

const createItemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace/create',
  component: function CreateRoute() {
    return withPageErrorBoundary(Create)({});
  },
})

const itemDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace/item/$id',
  component: function ItemDetailRoute() {
    return withPageErrorBoundary(ItemDetailPage)({});
  },
})

const marketplaceProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace/profile/$id',
  component: function MarketplaceProfileRoute() {
    return withPageErrorBoundary(MarketplaceProfilePage)({});
  },
})

const generateAPIKeyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/generate-api-key',
  component: function GenerateAPIKeyRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(GenerateAPIKey, {
        walletConnected: true,
        signedInToHaithe: true,
        hasOrg: true
      })
    )({});
  },
})

const chatListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/chat',
  component: function ChatListRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(ChatList, {
        walletConnected: true,
        signedInToHaithe: true,
        hasOrg: true
      })
    )({});
  },
})

const chatWithAgentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/agents/$id/chat',
  component: function ChatWithAgentRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(ChatWithAgent, {
        walletConnected: true,
        signedInToHaithe: true,
        hasOrg: true
      })
    )({});
  },
})

const chatSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/agents/$id/chat/settings',
  component: function ChatSettingsRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(ChatSettings, {
        walletConnected: true,
        signedInToHaithe: true,
        hasOrg: true
      })
    )({});
  },
})

const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/docs',
  component: function DocsRoute() {
    return withPageErrorBoundary(Docs)({});
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  dashboardRoute,
  profileRoute,
  agentsRoute,
  agentsConfigurationRoute,
  workflowsRoute,
  analyticsRoute,
  purchasesRoute,
  settingsRoute,
  helpRoute,
  testRoute,
  marketplaceRoute,
  becomeCreatorRoute,
  createItemsRoute,
  itemDetailRoute,
  marketplaceProfileRoute,
  generateAPIKeyRoute,
  chatListRoute,
  chatWithAgentRoute,
  chatSettingsRoute,
  docsRoute
])

const router = createRouter({
  routeTree,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router;