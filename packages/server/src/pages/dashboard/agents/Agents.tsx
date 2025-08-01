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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/lib/components/ui/alert-dialog";
import { truncateAddress } from "@/src/lib/utils";
import { copyToClipboard } from "@/utils";
import DashboardHeader from "../Header";
import { Separator } from "@/src/lib/components/ui/separator";

export default function AgentsPage() {
  const api = useHaitheApi();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [editAgent, setEditAgent] = useState<any>(null);
  const [deleteAgent, setDeleteAgent] = useState<any>(null);

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

  const handleDelete = async () => {
    try {
      if (!deleteAgent) return;
      await api.deleteProject.mutateAsync(deleteAgent.id);
      setDeleteAgent(null);
      agentsQuery.refetch();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <DashboardHeader
          title="Agents"
          subtitle="Manage your AI agents and their marketplace extensions."
          iconName="Bot"
        />

        <Button onClick={() => setCreateOpen(true)}>
          <Icon name="Plus" />
          <span className="hidden sm:block">New Agent</span>
        </Button>
      </div>

      <Separator className="bg-border/50" />

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
          <div className="grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-3 gap-6 @container">
            {agents.map((agent: any) => (
              <Card key={agent.id} className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
                <CardHeader className="relative pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="size-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20 flex-shrink-0">
                        <Icon name="Bot" className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold truncate">{agent.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {agent.status || 'Active'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {agent.type || 'AI Agent'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Button asChild size="icon" variant="ghost" className="size-8">
                        <Link to="/dashboard/agents/$id" params={{ id: agent.id.toString() }}>
                          <Icon name="Settings" className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => {
                          setEditAgent(agent);
                          setAgentName(agent.name);
                          setEditOpen(true);
                        }}
                      >
                        <Icon name="Pencil" className="size-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() => setDeleteAgent(agent)}
                          >
                            <Icon name="Trash2" className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{agent.name}"? This action cannot be undone and will permanently remove the agent and all its associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              disabled={api.deleteProject.isPending}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {api.deleteProject.isPending ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <CardDescription className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" className="size-3" />
                      Created {new Date(agent.created_at).toLocaleDateString()}
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative pt-0 space-y-4">
                  {/* Agent ID */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2">
                      <Icon name="Hash" className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Agent ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {truncateAddress(agent.project_uid)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(agent.project_uid, "Agent ID")}
                        className="size-6"
                      >
                        <Icon name="Copy" className="size-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center gap-2 w-full justify-end">
                    <Button asChild>
                      <Link to="/dashboard/agents/$id" params={{ id: agent.id.toString() }}>
                        <Icon name="Settings" className="size-4" />
                        Configure
                      </Link>
                    </Button>

                    <Button asChild>
                      <Link to="/dashboard/agents/$id/chat" params={{ id: agent.id.toString() }}>
                        <Icon name="MessageSquare" className="size-4" />
                        Chat
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Agent Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleCreate();
          }
        }}>
          <DialogHeader>
            <DialogTitle>Create New Agent</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Agent name"
            value={agentName}
            onChange={e => setAgentName(e.target.value)}
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
        <DialogContent onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleEdit();
          }
        }}>
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Agent name"
            value={agentName}
            onChange={e => setAgentName(e.target.value)}
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