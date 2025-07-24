import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/lib/components/ui/tabs";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { formatDate } from "@/src/lib/utils";
import { useStore } from "@/src/lib/hooks/use-store";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  description?: string;
  gradient?: string;
}

function StatsCard({
  title,
  value,
  icon,
  trend,
  description,
}: StatsCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br bg-secondary opacity-50`} />
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name={icon as any} className="size-5 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-xs ${trend.positive ? 'text-emerald-600' : 'text-red-600'
              }`}>
              <Icon
                name={trend.positive ? "TrendingUp" : "TrendingDown"}
                className="size-3"
              />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative pt-0">
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Zap" className="size-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Get started with common tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 @container">
        <div className="grid grid-cols-1 @2xl:grid-cols-3 gap-3">

          <Button variant="outline" className="justify-start h-auto p-4" asChild>
            <Link to="/dashboard/agents">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Icon name="Bot" className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Manage Agents</div>
                  <div className="text-xs text-muted-foreground">Configure AI agents</div>
                </div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" className="justify-start h-auto p-4" asChild>
            <Link to="/dashboard/workflows">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Icon name="GitBranch" className="size-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Build Workflows</div>
                  <div className="text-xs text-muted-foreground">Create automated flows</div>
                </div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" className="justify-start h-auto p-4" asChild>
            <Link to="/dashboard/organization">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Icon name="Building" className="size-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Organization</div>
                  <div className="text-xs text-muted-foreground">Manage team settings</div>
                </div>
              </div>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivitySection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Activity" className="size-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest actions and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 space-y-4">
          <Icon name="Clock" className="size-12 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">No Recent Activity</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your recent activities will appear here once you start using the platform.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const api = useHaitheApi();
  const [activeTab, setActiveTab] = useState("overview");

  // Get profile data
  const profileQuery = api.profile();
  const isLoggedIn = api.isLoggedIn;

  // Get utility values
  const isWeb3Ready = api.isWeb3Ready();
  const authToken = api.getAuthToken();
  
  // Get store data - must be called before any conditional returns
  const { selectedOrganizationId } = useStore();

  // All protection is now handled by ProtectedRoute wrapper
  // Just get the profile data (guaranteed to exist due to ProtectedRoute)
  const profile = profileQuery.data;
  
  if (!profile) {
    return null; // This should never happen with ProtectedRoute, but satisfies TypeScript
  }

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground leading-tight">
                Welcome back!
              </h1>
              <p className="text-muted-foreground text-md leading-relaxed max-w-2xl">
                {profile.address ? `Registered since ${formatDate(profile.registered, "MMM D, YYYY")}` : 'Manage your AI infrastructure and monitor performance'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex items-center justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Icon name="LayoutDashboard" className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center gap-2">
                <Icon name="Bot" className="size-4" />
                Agents
              </TabsTrigger>
              <TabsTrigger value="workflows" className="flex items-center gap-2">
                <Icon name="GitBranch" className="size-4" />
                Workflows
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatsCard
                title="Agents"
                value="0"
                icon="Bot"
                description="Running agents"
              />
              <StatsCard
                title="Workflows"
                value="0"
                icon="GitBranch"
                description="Automated flows"
              />
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <QuickActionsSection />
              <RecentActivitySection />
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="text-center py-20 space-y-4">
              <Icon name="Bot" className="size-16 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-medium">No Agents Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create your first AI agent to get started with automated tasks and workflows.
                </p>
              </div>
              <Button asChild>
                <Link to="/dashboard/agents">
                  <Icon name="Plus" className="size-4 mr-2" />
                  Create First Agent
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="text-center py-20 space-y-4">
              <Icon name="GitBranch" className="size-16 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-medium">No Workflows Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Build your first workflow to automate complex tasks with multiple agents.
                </p>
              </div>
              <Button asChild>
                <Link to="/dashboard/workflows">
                  <Icon name="Plus" className="size-4 mr-2" />
                  Create First Workflow
                </Link>
              </Button>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-20 space-y-4">
              <Icon name="TrendingUp" className="size-16 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-medium">Analytics Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Detailed analytics and insights will be available once you start using the platform.
                </p>
              </div>
              <Button asChild>
                <Link to="/dashboard/analytics">
                  <Icon name="TrendingUp" className="size-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 