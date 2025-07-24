import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import { withProtectedRoute } from "@/src/lib/components/app/ProtectedRoute";
import { useAnalytics } from '../lib/hooks/use-analytics';
import ModelPage from './home/models';
import ChatbotPage from './home/models/chatbot';
import Onboarding from './onboarding';
import Dashboard from './dashboard';
import Profile from './dashboard/profile';
import Settings from './dashboard/settings';
import Agents from './dashboard/agents';
import Workflows from './dashboard/workflows';
import Analytics from './dashboard/analytics';
import Purchases from './dashboard/purchases';
import Organization from './dashboard/organization';
import Help from './dashboard/help';
import Landing from './landing';
import Test from './test/test';
import Marketplace from './marketplace';

const rootRoute = createRootRoute({
  component: () => {
    useAnalytics();

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

// dynamic route for models
const modelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/model/$id',
  component: function Model() {
    return withPageErrorBoundary(ModelPage)({});
  },
})

// dynamic route for chatbot
const chatbotRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/model/$id/chat',
  component: function Chat() {
    return withPageErrorBoundary(ChatbotPage)({});
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

// settings route
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
const organizationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/organization',
  component: function OrganizationRoute() {
    return withPageErrorBoundary(
      withProtectedRoute(Organization, {
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  modelRoute,
  chatbotRoute,
  onboardingRoute,
  dashboardRoute,
  profileRoute,
  settingsRoute,
  agentsRoute,
  workflowsRoute,
  analyticsRoute,
  purchasesRoute,
  organizationRoute,
  helpRoute,
  testRoute,
  marketplaceRoute
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