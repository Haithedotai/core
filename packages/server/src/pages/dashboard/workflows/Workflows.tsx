import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/lib/components/ui/tabs";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import type { Workflow } from "@/src/lib/types";

interface WorkflowCardProps {
  workflow: Workflow;
  onView?: (workflow: Workflow) => void;
  onEdit?: (workflow: Workflow) => void;
  onRun?: (workflow: Workflow) => void;
}

function WorkflowCard({ workflow, onView, onEdit, onRun }: WorkflowCardProps) {
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

        <div className="flex gap-2">
          {workflow.status === 'active' && (
            <Button variant="default" size="sm" onClick={() => onRun?.(workflow)} className="flex-1">
              <Icon name="Play" className="size-4 mr-2" />
              Run
            </Button>
          )}
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

export default function WorkflowsPage() {
  // Mock data - replace with actual API calls
  const [workflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Customer Onboarding Flow',
      description: 'Complete customer onboarding process with multiple AI agents handling different steps',
      organization_id: 'org1',
      user_id: 'user1',
      status: 'active',
      nodes: [
        { id: '1', agent_id: '1', position: { x: 100, y: 100 }, configuration: {} },
        { id: '2', agent_id: '2', position: { x: 300, y: 100 }, configuration: {} },
        { id: '3', agent_id: '3', position: { x: 500, y: 100 }, configuration: {} }
      ],
      edges: [
        { id: '1', source_node_id: '1', target_node_id: '2' },
        { id: '2', source_node_id: '2', target_node_id: '3' }
      ],
      metadata: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Content Generation Pipeline',
      description: 'Automated content creation workflow from research to publication',
      organization_id: 'org1',
      user_id: 'user1',
      status: 'draft',
      nodes: [
        { id: '4', agent_id: '1', position: { x: 100, y: 200 }, configuration: {} },
        { id: '5', agent_id: '2', position: { x: 300, y: 200 }, configuration: {} }
      ],
      edges: [
        { id: '3', source_node_id: '4', target_node_id: '5' }
      ],
      metadata: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Data Processing Workflow',
      description: 'End-to-end data processing and analysis with multiple specialized agents',
      organization_id: 'org1',
      user_id: 'user1',
      status: 'paused',
      nodes: [
        { id: '6', agent_id: '3', position: { x: 100, y: 300 }, configuration: {} }
      ],
      edges: [],
      metadata: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]);

  const activeWorkflows = workflows.filter(workflow => workflow.status === 'active');
  const draftWorkflows = workflows.filter(workflow => workflow.status === 'draft');
  const pausedWorkflows = workflows.filter(workflow => workflow.status === 'paused');

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-foreground leading-tight">Workflows</h1>
              <p className="text-muted-foreground text-xl leading-relaxed">
                Orchestrate multiple agents into powerful automated processes
              </p>
            </div>
            <Button asChild size="lg" className="shadow-lg">
              <Link to="/workflows">
                <Icon name="Plus" className="size-4 mr-2" />
                Create Workflow
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
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Icon name="GitBranch" className="size-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{workflows.length}</div>
                <div className="text-sm text-muted-foreground">Total Workflows</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Icon name="Play" className="size-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeWorkflows.length}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <Icon name="Pencil" className="size-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{draftWorkflows.length}</div>
                <div className="text-sm text-muted-foreground">Drafts</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900/20">
                <Icon name="Pause" className="size-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pausedWorkflows.length}</div>
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
              All Workflows ({workflows.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-base py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Active ({activeWorkflows.length})
            </TabsTrigger>
            <TabsTrigger value="draft" className="text-base py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Drafts ({draftWorkflows.length})
            </TabsTrigger>
            <TabsTrigger value="paused" className="text-base py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Paused ({pausedWorkflows.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {workflows.length === 0 ? (
              <div className="text-center py-20 space-y-8">
                <Icon name="GitBranch" className="size-20 text-muted-foreground mx-auto" />
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold leading-relaxed">No workflows yet</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                    Create your first workflow to orchestrate multiple agents into a powerful automated process.
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link to="/workflows">
                    <Icon name="Plus" className="size-4 mr-2" />
                    Create Your First Workflow
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onView={(workflow) => console.log('View workflow:', workflow.id)}
                    onEdit={(workflow) => console.log('Edit workflow:', workflow.id)}
                    onRun={(workflow) => console.log('Run workflow:', workflow.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onView={(workflow) => console.log('View workflow:', workflow.id)}
                  onEdit={(workflow) => console.log('Edit workflow:', workflow.id)}
                  onRun={(workflow) => console.log('Run workflow:', workflow.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="draft">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onView={(workflow) => console.log('View workflow:', workflow.id)}
                  onEdit={(workflow) => console.log('Edit workflow:', workflow.id)}
                  onRun={(workflow) => console.log('Run workflow:', workflow.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="paused">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pausedWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  onView={(workflow) => console.log('View workflow:', workflow.id)}
                  onEdit={(workflow) => console.log('Edit workflow:', workflow.id)}
                  onRun={(workflow) => console.log('Run workflow:', workflow.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 