import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import HomePage from "./home";
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
import Create from './dashboard/create';
import Landing from './landing';
import Test from './test/test';

const rootRoute = createRootRoute({
  component: () => {
    useAnalytics();

    return (
      <>
        <Outlet />
      </>
    )
  },
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    return withPageErrorBoundary(HomePage)({});
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
    return withPageErrorBoundary(Onboarding)({});
  },
})

// dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: function DashboardRoute() {
    return withPageErrorBoundary(Dashboard)({});
  },
})

// profile route
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: function ProfileRoute() {
    return withPageErrorBoundary(Profile)({});
  },
})

// settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: function SettingsRoute() {
    return withPageErrorBoundary(Settings)({});
  },
})

// agents route (renamed from projects)
const agentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agents',
  component: function AgentsRoute() {
    return withPageErrorBoundary(Agents)({});
  },
})

// workflows route (new)
const workflowsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workflows',
  component: function WorkflowsRoute() {
    return withPageErrorBoundary(Workflows)({});
  },
})

// models route (existing models page)
const modelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/models',
  component: function ModelsRoute() {
    return withPageErrorBoundary(ModelPage)({});
  },
})

// analytics route
const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: function AnalyticsRoute() {
    return withPageErrorBoundary(Analytics)({});
  },
})

// purchases route
const purchasesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/purchases',
  component: function PurchasesRoute() {
    return withPageErrorBoundary(Purchases)({});
  },
})

// organization route
const organizationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organization',
  component: function OrganizationRoute() {
    return withPageErrorBoundary(Organization)({});
  },
})

// help route
const helpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/help',
  component: function HelpRoute() {
    return withPageErrorBoundary(Help)({});
  },
})

// create route
const createItemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: function CreateRoute() {
    return withPageErrorBoundary(Create)({});
  },
})

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/landing',
  component: function LandingRoute() {
    return withPageErrorBoundary(Landing)({});
  },
})

const testRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/test',
  component: function TestRoute() {
    return withPageErrorBoundary(Test)({});
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
  modelsRoute,
  analyticsRoute,
  purchasesRoute,
  organizationRoute,
  helpRoute,
  createItemRoute,
  landingRoute,
  testRoute
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