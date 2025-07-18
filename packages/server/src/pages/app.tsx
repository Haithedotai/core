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
import Landing from './landing';

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

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/landing',
  component: function LandingRoute() {
    return withPageErrorBoundary(Landing)({});
  },
})

const routeTree = rootRoute.addChildren([indexRoute, creatorRoute, modelRoute, chatbotRoute, onboardingRoute, dashboardRoute, landingRoute])
const router = createRouter({
  routeTree,
})
  
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router;