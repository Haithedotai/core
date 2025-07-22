import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/lib/components/ui/tabs";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import type { Agent } from "@/src/lib/types";

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

export default function AgentsPage() {
  // Mock data - replace with actual API calls
  const [agents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Customer Support Agent',
      description: 'Handles customer inquiries and support requests with natural language processing',
      user_id: 'user1',
      organization_id: 'org1',
      agent_type: 'experiment',
      status: 'active',
      privacy: 'organization',
      components: [
        { id: '1', name: 'NLP Component', type: 'custom', configuration: {} },
        { id: '2', name: 'Knowledge Base', type: 'knowledge_base', configuration: {} }
      ],
      model_id: '1',
      members: ['user1', 'user2'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Content Creator Agent',
      description: 'Generates marketing content and social media posts using advanced language models',
      user_id: 'user1',
      organization_id: 'org1',
      agent_type: 'model',
      status: 'development',
      privacy: 'organization',
      components: [
        { id: '3', name: 'Content Generator', type: 'custom', configuration: {} }
      ],
      model_id: '2',
      members: ['user1'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Data Analysis Agent',
      description: 'Analyzes large datasets and provides insights for business decisions',
      user_id: 'user1',
      organization_id: 'org1',
      agent_type: 'workflow',
      status: 'paused',
      privacy: 'organization',
      components: [
        { id: '4', name: 'Data Processor', type: 'tool', configuration: {} },
        { id: '5', name: 'Visualization Tool', type: 'custom', configuration: {} }
      ],
      model_id: '1',
      members: ['user1', 'user2', 'user3'],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]);

  const activeAgents = agents.filter(agent => agent.status === 'active');
  const developmentAgents = agents.filter(agent => agent.status === 'development');
  const pausedAgents = agents.filter(agent => agent.status === 'paused');

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-foreground leading-tight">Agents</h1>
              <p className="text-muted-foreground text-xl leading-relaxed">
                Manage your AI-powered agents and their capabilities
              </p>
            </div>
            <Button asChild size="lg" className="shadow-lg">
              <Link to="/agents/create">
                <Icon name="Plus" className="size-4 mr-2" />
                Create Agent
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Icon name="Bot" className="size-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{agents.length}</div>
                <div className="text-sm text-muted-foreground">Total Agents</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Icon name="Activity" className="size-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeAgents.length}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <Icon name="Clock" className="size-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{developmentAgents.length}</div>
                <div className="text-sm text-muted-foreground">In Development</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900/20">
                <Icon name="Pause" className="size-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pausedAgents.length}</div>
                <div className="text-sm text-muted-foreground">Paused</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/50 p-1 h-auto">
            <TabsTrigger value="all" className="text-base py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              All Agents ({agents.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-base py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Active ({activeAgents.length})
            </TabsTrigger>
            <TabsTrigger value="development" className="text-base py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Development ({developmentAgents.length})
            </TabsTrigger>
            <TabsTrigger value="paused" className="text-base py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Paused ({pausedAgents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {agents.length === 0 ? (
              <div className="text-center py-20 space-y-8">
                <Icon name="Bot" className="size-20 text-muted-foreground mx-auto" />
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold leading-relaxed">No agents yet</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                    Create your first AI agent to get started with automating tasks and processes.
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link to="/agents/create">
                    <Icon name="Plus" className="size-4 mr-2" />
                    Create Your First Agent
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </TabsContent>

          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onView={(agent) => console.log('View agent:', agent.id)}
                  onEdit={(agent) => console.log('Edit agent:', agent.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="development">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {developmentAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onView={(agent) => console.log('View agent:', agent.id)}
                  onEdit={(agent) => console.log('Edit agent:', agent.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="paused">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pausedAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onView={(agent) => console.log('View agent:', agent.id)}
                  onEdit={(agent) => console.log('Edit agent:', agent.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 