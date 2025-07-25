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
    <Card className="relative overflow-hidden shadow-lg border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <div className={`absolute inset-0 bg-gradient-to-br from-primary/[0.08] to-secondary/[0.02]`} />
      <CardHeader className="relative pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center border border-primary/20">
              <Icon name={icon as any} className="size-6 text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold text-foreground">
              {title}
            </CardTitle>
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${trend.positive
              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
              : 'text-red-600 bg-red-50 dark:bg-red-950/30'
              }`}>
              <Icon
                name={trend.positive ? "TrendingUp" : "TrendingDown"}
                className="size-3"
              />
              <span className="font-medium">{trend.value}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative pt-0">
        <div className="text-3xl font-bold text-foreground mb-2">
          {value}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionsSection() {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-3">
            <Icon name="Zap" className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription className="mt-1">
              Get started with common tasks
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4 @container">
        <div className="grid grid-cols-1 @2xl:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start h-auto p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-border/50 bg-gradient-to-r from-background to-background/50 backdrop-blur-sm" asChild>
            <Link to="/dashboard/agents">
              <div className="flex items-center gap-3">
                <div className="p-3">
                  <Icon name="Bot" className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Manage Agents</div>
                  <div className="text-xs text-muted-foreground">Configure AI agents</div>
                </div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" className="justify-start h-auto p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-border/50 bg-gradient-to-r from-background to-background/50 backdrop-blur-sm" asChild>
            <Link to="/dashboard/workflows">
              <div className="flex items-center gap-3">
                <div className="p-3">
                  <Icon name="GitBranch" className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Build Workflows</div>
                  <div className="text-xs text-muted-foreground">Create automated flows</div>
                </div>
              </div>
            </Link>
          </Button>

          <Button variant="outline" className="justify-start h-auto p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-border/50 bg-gradient-to-r from-background to-background/50 backdrop-blur-sm" asChild>
            <Link to="/dashboard/settings">
              <div className="flex items-center gap-3">
                <div className="p-3">
                  <Icon name="Settings" className="size-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Settings</div>
                  <div className="text-xs text-muted-foreground">Manage preferences</div>
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
    <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-3">
            <Icon name="Activity" className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription className="mt-1">
              Your latest actions and updates
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-center py-16 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto border border-border/50">
            <Icon name="Clock" className="size-8 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">No Recent Activity</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
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
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-lg bg-gradient-to-br from-primary/5 to-primary/2 flex items-center justify-center border border-primary/20">
                  <Icon name="LayoutDashboard" className="size-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                    {profile.address ? `Registered since ${formatDate(profile.registered, "MMM D, YYYY")}` : 'Manage your AI infrastructure and monitor performance'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex items-center justify-center">
            <TabsList className="grid w-full max-w-2xl grid-cols-3 shadow-lg bg-gradient-to-r from-background to-background/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/5">
                <Icon name="LayoutDashboard" className="size-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/5">
                <Icon name="Bot" className="size-4" />
                Agents
              </TabsTrigger>
              <TabsTrigger value="workflows" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/5">
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
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
              <CardContent className="relative">
                <div className="text-center py-20 space-y-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto border border-border/50">
                    <Icon name="Bot" className="size-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-foreground">No Agents Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Create your first AI agent to get started with automated tasks and workflows.
                    </p>
                  </div>
                  <Button asChild className="shadow-lg">
                    <Link to="/dashboard/agents">
                      <Icon name="Plus" className="size-4 mr-2" />
                      Create First Agent
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
              <CardContent className="relative">
                <div className="text-center py-20 space-y-6">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto border border-border/50">
                    <Icon name="GitBranch" className="size-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-foreground">No Workflows Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Build your first workflow to automate complex tasks with multiple agents.
                    </p>
                  </div>
                  <Button asChild className="shadow-lg">
                    <Link to="/dashboard/workflows">
                      <Icon name="Plus" className="size-4 mr-2" />
                      Create First Workflow
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 