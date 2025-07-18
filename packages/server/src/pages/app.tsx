import {
  Outlet,
  createRouter,
  createRoute,
  createRootRoute,
} from '@tanstack/react-router'
import { withPageErrorBoundary } from "@/src/lib/components/errors/PageErrorBoundary";
import HomePage from "./home";
import { useAnalytics } from '../lib/hooks/use-analytics';
import CreatorPage from './creator';
import ModelPage from './models';
import ChatbotPage from './chatbot';
import Onboarding from './onboarding';
import Dashboard from './dashboard';
import Marketplace from './marketplace';
import Profile from './profile';
import Settings from './settings';
import Projects from './projects';
import Analytics from './analytics';
import Purchases from './purchases';
import Organization from './organization';
import Help from './help';
import Create from './create';

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

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace',
  component: function MarketplaceRoute() {
    return withPageErrorBoundary(Marketplace)({});
  },
})

const creatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/creator',
  component: function Dynamic() {
    return withPageErrorBoundary(CreatorPage)({});
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

// projects route
const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  component: function ProjectsRoute() {
    return withPageErrorBoundary(Projects)({});
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  marketplaceRoute,
  creatorRoute,
  modelRoute,
  chatbotRoute,
  onboardingRoute,
  dashboardRoute,
  profileRoute,
  settingsRoute,
  projectsRoute,
  analyticsRoute,
  purchasesRoute,
  organizationRoute,
  helpRoute,
  createItemRoute
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