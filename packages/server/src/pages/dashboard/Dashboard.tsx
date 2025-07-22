import { useState, useEffect } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Separator } from "@/src/lib/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/lib/components/ui/tabs";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { useAppStore } from "@/src/lib/stores/useAppStore";
import type { Model, Agent, Workflow, DashboardStats } from "@/src/lib/types";

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

function StatsCard({ title, value, icon, trend, description, gradient = "from-blue-500 to-blue-600" }: StatsCardProps) {
  const renderIcon = () => {
    const iconProps = "h-6 w-6 text-white";
    switch (icon) {
      case 'Brain': return <Icon name="Brain" className={iconProps} />;
      case 'Bot': return <Icon name="Bot" className={iconProps} />;
      case 'GitBranch': return <Icon name="GitBranch" className={iconProps} />;
      case 'Activity': return <Icon name="Activity" className={iconProps} />;
      case 'Users': return <Icon name="Users" className={iconProps} />;
      case 'TrendingUp': return <Icon name="TrendingUp" className={iconProps} />;
      default: return <Icon name="Bot" className={iconProps} />;
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-90`} />
      <CardContent className="relative p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-white/20 backdrop-blur-sm`}>
            {renderIcon()}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm`}>
              {trend.positive ? (
                <Icon name="TrendingUp" className="size-3" />
              ) : (
                <Icon name="TrendingDown" className="size-3" />
              )}
              {trend.positive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-3xl font-bold leading-none">
            {value}
          </div>
          <div className="text-sm font-medium opacity-90 leading-relaxed">
            {title}
          </div>
          {description && (
            <div className="text-xs opacity-75 leading-relaxed">
              {description}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ModelCardProps {
  model: Model;
  onConfigure?: (model: Model) => void;
  onView?: (model: Model) => void;
}

function ModelCard({ model, onConfigure, onView }: ModelCardProps) {
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'anthropic': return '🧠';
      case 'google': return '🔍';
      case 'cohere': return '💬';
      case 'moonshot': return '🌙';
      case 'meta': return '📘';
      case 'mistral': return '🌪️';
      case 'groq': return '⚡';
      default: return '🤖';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'anthropic': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'google': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'moonshot': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border border-border/50 group">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="text-2xl">{getProviderIcon(model.provider)}</div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight mb-3">
              {model.name}
            </CardTitle>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className={`text-xs font-medium border ${getProviderColor(model.provider)}`}>
                {model.provider}
              </Badge>
              <Badge variant={model.is_enabled ? "default" : "secondary"} className="text-xs font-medium">
                {model.is_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <CardDescription className="line-clamp-3 mb-6 text-sm leading-relaxed text-muted-foreground">
          {model.description}
        </CardDescription>

        <div className="space-y-3 mb-6 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Context Length:</span>
            <span className="font-medium">{model.context_length.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Capabilities:</span>
            <span className="font-medium">{model.capabilities.length}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => onView?.(model)} className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
            <Icon name="Eye" className="size-4 mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => onConfigure?.(model)} className="flex-1 hover:bg-secondary hover:text-secondary-foreground transition-colors duration-300">
            <Icon name="Settings" className="size-4 mr-2" />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface AgentCardProps {
  agent: Agent;
  onView?: (agent: Agent) => void;
  onEdit?: (agent: Agent) => void;
}

function AgentCard({ agent, onView, onEdit }: AgentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
      case 'development': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
      case 'paused': return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
      case 'archived': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border border-border/50 group">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors duration-300">
            <Icon name="Bot" className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight mb-3">
              {agent.name}
            </CardTitle>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-xs font-medium">
                {agent.agent_type}
              </Badge>
              <Badge variant="outline" className={`text-xs font-medium border ${getStatusColor(agent.status)}`}>
                {agent.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {agent.description && (
          <CardDescription className="line-clamp-3 mb-6 text-sm leading-relaxed text-muted-foreground">
            {agent.description}
          </CardDescription>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Icon name="Package" className="size-4" />
            <span className="font-medium">{agent.components.length} components</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Users" className="size-4" />
            <span className="font-medium">{agent.members.length} members</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => onView?.(agent)} className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
            <Icon name="Eye" className="size-4 mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit?.(agent)} className="flex-1 hover:bg-secondary hover:text-secondary-foreground transition-colors duration-300">
            <Icon name="Pencil" className="size-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface WorkflowCardProps {
  workflow: Workflow;
  onView?: (workflow: Workflow) => void;
  onEdit?: (workflow: Workflow) => void;
}

function WorkflowCard({ workflow, onView, onEdit }: WorkflowCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
      case 'draft': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
      case 'paused': return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
      case 'archived': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border border-border/50 group">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors duration-300">
            <Icon name="GitBranch" className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight mb-3">
              {workflow.name}
            </CardTitle>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className={`text-xs font-medium border ${getStatusColor(workflow.status)}`}>
                {workflow.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {workflow.description && (
          <CardDescription className="line-clamp-3 mb-6 text-sm leading-relaxed text-muted-foreground">
            {workflow.description}
          </CardDescription>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Icon name="Bot" className="size-4" />
            <span className="font-medium">{workflow.nodes.length} agents</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Calendar" className="size-4" />
            <span className="font-medium">{new Date(workflow.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => onView?.(workflow)} className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
            <Icon name="Eye" className="size-4 mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit?.(workflow)} className="flex-1 hover:bg-secondary hover:text-secondary-foreground transition-colors duration-300">
            <Icon name="Pencil" className="size-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const {
    currentUser,
    currentOrganization,
    getDashboardStats
  } = useAppStore();

  const [models, setModels] = useState<Model[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<DashboardStats>({});

  useEffect(() => {
    if (currentUser && currentOrganization) {
      loadDashboardData();
    }
  }, [currentUser, currentOrganization]);

  const loadDashboardData = async () => {
    if (!currentUser || !currentOrganization) return;

    try {
      // Mock data for now - replace with actual API calls
      setModels([
        {
          id: '1',
          name: 'GPT-4 Turbo',
          description: 'Most capable GPT-4 model, optimized for instruction following',
          provider: 'openai',
          model_id: 'gpt-4-turbo-preview',
          context_length: 128000,
          input_cost_per_token: 0.00001,
          output_cost_per_token: 0.00003,
          capabilities: ['text', 'code', 'function_calling'],
          organization_id: currentOrganization.id,
          is_enabled: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Claude 3 Sonnet',
          description: 'Balanced model for a wide range of tasks',
          provider: 'anthropic',
          model_id: 'claude-3-sonnet-20240229',
          context_length: 200000,
          input_cost_per_token: 0.000003,
          output_cost_per_token: 0.000015,
          capabilities: ['text', 'vision', 'code'],
          organization_id: currentOrganization.id,
          is_enabled: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]);

      setAgents([
        {
          id: '1',
          name: 'Customer Support Agent',
          description: 'Handles customer inquiries and support requests',
          user_id: currentUser.id,
          organization_id: currentOrganization.id,
          agent_type: 'experiment',
          status: 'active',
          privacy: 'organization',
          components: [],
          model_id: '1',
          members: [currentUser.id],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Content Creator Agent',
          description: 'Generates marketing content and social media posts',
          user_id: currentUser.id,
          organization_id: currentOrganization.id,
          agent_type: 'model',
          status: 'development',
          privacy: 'organization',
          components: [],
          model_id: '2',
          members: [currentUser.id],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]);

      setWorkflows([
        {
          id: '1',
          name: 'Customer Onboarding Flow',
          description: 'Complete customer onboarding process with multiple agents',
          organization_id: currentOrganization.id,
          user_id: currentUser.id,
          status: 'active',
          nodes: [
            { id: '1', agent_id: '1', position: { x: 0, y: 0 }, configuration: {} },
            { id: '2', agent_id: '2', position: { x: 200, y: 0 }, configuration: {} }
          ],
          edges: [
            { id: '1', source_node_id: '1', target_node_id: '2' }
          ],
          metadata: {},
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]);

      // Get stats
      setStats({
        total_models: 2,
        total_agents: 2,
        total_workflows: 1,
        active_agents: 1,
        active_workflows: 1,
        total_agent_runs: 156,
        total_workflow_executions: 42
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-1 shadow-lg">
          <CardContent className="text-center space-y-8 p-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="User" className="size-10 text-primary" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold leading-tight">Welcome to Haithe</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect your wallet to access your organization dashboard and start building with AI.
              </p>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link to="/">
                <Icon name="Wallet" className="size-4 mr-2" />
                Connect Wallet
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-1 shadow-lg">
          <CardContent className="text-center space-y-8 p-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="Building" className="size-10 text-primary" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold leading-tight">Join an Organization</h3>
              <p className="text-muted-foreground leading-relaxed">
                You need to be part of an organization to access the dashboard. Create or join one to get started.
              </p>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link to="/organization">
                <Icon name="Plus" className="size-4 mr-2" />
                Create Organization
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm supports-[backdrop-filter]:bg-card/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                    {currentOrganization.name} Dashboard
                  </h1>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Manage your AI models, agents, and workflows
                  </p>
                </div>
              </div>
            </div>
            
            <Card className="flex h-fit">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon name="Users" className="size-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{currentUser.name || 'User'}</div>
                  <div className="text-sm text-muted-foreground">Organization Member</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Stats */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Overview</h2>
              <p className="text-muted-foreground">Your organization's AI infrastructure at a glance</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatsCard
                title="Available Models"
                value={stats.total_models || 0}
                icon="Brain"
                description="LLM models configured"
                gradient="from-blue-500 to-blue-600"
              />
              <StatsCard
                title="Active Agents"
                value={stats.active_agents || 0}
                icon="Bot"
                description={`of ${stats.total_agents || 0} total`}
                gradient="from-emerald-500 to-emerald-600"
                trend={{ value: 12, positive: true }}
              />
              <StatsCard
                title="Workflows"
                value={stats.total_workflows || 0}
                icon="GitBranch"
                description="Agent orchestrations"
                gradient="from-purple-500 to-purple-600"
              />
              <StatsCard
                title="Total Runs"
                value={stats.total_agent_runs || 0}
                icon="Activity"
                description="Agent executions"
                gradient="from-amber-500 to-amber-600"
                trend={{ value: 23, positive: true }}
              />
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Quick Actions</h2>
              <p className="text-muted-foreground">Get started with common tasks</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <Link to="/agents" className="block h-full">
                  <CardContent className="p-6 h-full flex flex-col items-center text-center space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
                    <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon name="Bot" className="size-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">Create Agent</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">Build a new AI agent for your organization</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <Link to="/workflows" className="block h-full">
                  <CardContent className="p-6 h-full flex flex-col items-center text-center space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
                    <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon name="GitBranch" className="size-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">Create Workflow</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">Orchestrate multiple agents in a flow</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <Link to="/models" className="block h-full">
                  <CardContent className="p-6 h-full flex flex-col items-center text-center space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
                    <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon name="Brain" className="size-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">Configure Models</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">Manage your LLM model preferences</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your AI Infrastructure</h2>
              <p className="text-muted-foreground">Models, agents, and workflows in your organization</p>
            </div>

            <Tabs defaultValue="agents" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 h-auto">
                <TabsTrigger value="agents" className="text-base py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Icon name="Bot" className="size-4 mr-2" />
                  Agents ({agents.length})
                </TabsTrigger>
                <TabsTrigger value="workflows" className="text-base py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Icon name="GitBranch" className="size-4 mr-2" />
                  Workflows ({workflows.length})
                </TabsTrigger>
                <TabsTrigger value="models" className="text-base py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Icon name="Brain" className="size-4 mr-2" />
                  Models ({models.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="agents">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-6 bg-gradient-to-r from-card to-card/80">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Icon name="Bot" className="size-6 text-primary" />
                        Your Agents
                      </CardTitle>
                      <Button asChild className="shadow-lg">
                        <Link to="/agents">
                          <Icon name="Plus" className="size-4 mr-2" />
                          Create Agent
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {agents.length === 0 ? (
                      <div className="text-center py-16 space-y-8">
                        <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="Bot" className="size-12 text-primary" />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold leading-tight">Create your first agent</h3>
                          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                            Agents are AI-powered assistants that can perform specific tasks for your organization.
                          </p>
                        </div>
                        <Button asChild size="lg" className="shadow-lg">
                          <Link to="/agents">
                            <Icon name="Plus" className="size-4 mr-2" />
                            Create Your First Agent
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {agents.map((agent) => (
                          <AgentCard
                            key={agent.id}
                            agent={agent}
                            onView={(agent) => console.log('View agent:', agent.id)}
                            onEdit={(agent) => console.log('Edit agent:', agent.id)}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workflows">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-6 bg-gradient-to-r from-card to-card/80">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Icon name="GitBranch" className="size-6 text-primary" />
                        Your Workflows
                      </CardTitle>
                      <Button asChild className="shadow-lg">
                        <Link to="/workflows">
                          <Icon name="Plus" className="size-4 mr-2" />
                          Create Workflow
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {workflows.length === 0 ? (
                      <div className="text-center py-16 space-y-8">
                        <div className="w-24 h-24 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                          <Icon name="GitBranch" className="size-12 text-purple-600" />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold leading-tight">Create your first workflow</h3>
                          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                            Workflows orchestrate multiple agents to create complex AI-powered processes.
                          </p>
                        </div>
                        <Button asChild size="lg" className="shadow-lg bg-purple-600 hover:bg-purple-700">
                          <Link to="/workflows">
                            <Icon name="Plus" className="size-4 mr-2" />
                            Create Your First Workflow
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {workflows.map((workflow) => (
                          <WorkflowCard
                            key={workflow.id}
                            workflow={workflow}
                            onView={(workflow) => console.log('View workflow:', workflow.id)}
                            onEdit={(workflow) => console.log('Edit workflow:', workflow.id)}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="models">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-6 bg-gradient-to-r from-card to-card/80">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Icon name="Brain" className="size-6 text-primary" />
                        Available Models
                      </CardTitle>
                      <Button asChild className="shadow-lg">
                        <Link to="/models">
                          <Icon name="Plus" className="size-4 mr-2" />
                          Add Model
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {models.length === 0 ? (
                      <div className="text-center py-16 space-y-8">
                        <div className="w-24 h-24 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                          <Icon name="Brain" className="size-12 text-blue-600" />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold leading-tight">Configure your models</h3>
                          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                            Add and configure LLM models that your agents can use to power their capabilities.
                          </p>
                        </div>
                        <Button asChild size="lg" className="shadow-lg bg-blue-600 hover:bg-blue-700">
                          <Link to="/models">
                            <Icon name="Plus" className="size-4 mr-2" />
                            Add Your First Model
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {models.map((model) => (
                          <ModelCard
                            key={model.id}
                            model={model}
                            onView={(model) => console.log('View model:', model.id)}
                            onConfigure={(model) => console.log('Configure model:', model.id)}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  );
} 