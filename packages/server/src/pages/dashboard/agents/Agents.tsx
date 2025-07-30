import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Input } from "@/src/lib/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useStore } from "@/src/lib/hooks/use-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/lib/components/ui/dialog";

export default function AgentsPage() {
  const api = useHaitheApi();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [editAgent, setEditAgent] = useState<any>(null);

  // Get profile data
  const profileQuery = api.profile();
  const orgId = useStore((s) => s.selectedOrganizationId);
  const agentsQuery = api.getProjects(orgId);

  // Loading state
  if (profileQuery.isPending || (orgId && agentsQuery.isPending)) {
    return (
      <div className="min-h-full bg-background p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!profileQuery.data) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icon name="Bot" className="size-16 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Authentication Required</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please log in to view your agents.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filtered agents
  const agents = (agentsQuery.data || [])
    .filter((agent: any) => agent.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Handlers
  const handleCreate = async () => {
    if (!orgId || !agentName) return;
    await api.createProject.mutateAsync({ orgId, name: agentName });
    setCreateOpen(false);
    setAgentName("");
    agentsQuery.refetch();
  };

  const handleEdit = async () => {
    try {
      if (!editAgent || !agentName) return;
      await api.updateProject.mutateAsync({ id: editAgent.id, name: agentName });
      setEditOpen(false);
      setEditAgent(null);
      setAgentName("");
      agentsQuery.refetch();
    } catch (error) {
      console.error(error);
    }
  };

  console.log("Agents:", agents);

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="space-y-3 flex items-center w-full justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-lg bg-gradient-to-br from-primary/5 to-primary/2 flex items-center justify-center border border-primary/20">
                  <Icon name="Bot" className="size-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    Agents
                  </h1>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                    Manage your AI agents and their marketplace extensions.
                  </p>
                </div>
              </div>

              <Button onClick={() => setCreateOpen(true)}>
                <Icon name="Plus" className="mr-2" /> New Agent
              </Button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Agents Grid */}
        {agents.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="Bot" className="size-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No agents found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get started by creating your first AI agent.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent: any) => (
              <Card key={agent.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{agent.name}</span>
                    <div>
                      <Button asChild size="icon" variant="ghost">
                        <Link to="/dashboard/agents/$id" params={{ id: agent.id.toString() }}>
                          <Icon name="Settings" />
                        </Link>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => {
                        setEditAgent(agent);
                        setAgentName(agent.name);
                        setEditOpen(true);
                      }}>
                        <Icon name="Pencil" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>Created: {new Date(agent.created_at).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge>Agent ID: {agent.project_uid}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Agent Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Agent name"
            value={agentName}
            onChange={e => setAgentName(e.target.value)}
            className="mb-4"
          />
          <DialogFooter>
            <Button onClick={handleCreate} disabled={!agentName || api.createProject.isPending}>
              {api.createProject.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Agent Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Agent name"
            value={agentName}
            onChange={e => setAgentName(e.target.value)}
            className="mb-4"
          />
          <DialogFooter>
            <Button onClick={handleEdit} disabled={!agentName || api.updateProject.isPending}>
              {api.updateProject.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 