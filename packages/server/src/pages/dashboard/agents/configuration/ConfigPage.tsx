import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Switch } from "@/src/lib/components/ui/switch";
import { Input } from "@/src/lib/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import { Separator } from "@/src/lib/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/lib/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/lib/components/ui/tabs";

import { Label } from "@/src/lib/components/ui/label";
import { Textarea } from "@/src/lib/components/ui/textarea";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useStore } from "@/src/lib/hooks/use-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/src/lib/components/ui/dialog";
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
import { copyToClipboard } from "../../../../../utils";
import DashboardHeader from "../../Header";
import { toast } from "sonner";

export default function AgentsConfigurationPage() {
  const params = useParams({ from: "/dashboard/agents/$id" });
  const api = useHaitheApi();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [deleteAgent, setDeleteAgent] = useState<any>(null);
  
  // Project members state
  const [isAddProjectMemberDialogOpen, setIsAddProjectMemberDialogOpen] = useState(false);
  const [newProjectMemberAddress, setNewProjectMemberAddress] = useState("");
  const [newProjectMemberRole, setNewProjectMemberRole] = useState<"admin" | "developer" | "viewer">("viewer");

  // Telegram token state
  const [telegramToken, setTelegramToken] = useState("");

  // Get profile data
  const profileQuery = api.profile();
  const orgId = useStore((s) => s.selectedOrganizationId);
  const { data: project, isLoading: isLoadingProject, refetch: refetchProject } = api.getProject(parseInt(params.id));

  // Get organization data
  const { data: organization } = api.getOrganization(orgId);

  // Get enabled products for the organization
  const { data: enabledProductAddresses, isLoading: isLoadingEnabledProducts, refetch: refetchEnabledProducts } = api.getEnabledProducts(organization?.address || "");

  // Get all products to match with enabled addresses
  const { data: allProducts, isLoading: isLoadingAllProducts } = api.getAllProducts();

  // Get project-specific enabled products
  const { data: projectProductIds, isLoading: isLoadingProjectProducts, refetch: refetchProjectProducts } = api.getProjectProducts(parseInt(params.id));
  
  // Get project members
  const { data: projectMembers, isLoading: isLoadingProjectMembers, refetch: refetchProjectMembers } = api.getProjectMembers(parseInt(params.id));

  // Loading state
  if (profileQuery.isPending || isLoadingProject || isLoadingEnabledProducts || isLoadingAllProducts || isLoadingProjectProducts || isLoadingProjectMembers || !api.isClientInitialized()) {
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
              Please log in to configure your agent.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icon name="Bot" className="size-16 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Project Not Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              The requested project could not be found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Match enabled product addresses with full product data
  const enabledProducts = allProducts?.filter(product =>
    enabledProductAddresses?.some(address =>
      address.toLowerCase() === product.address.toLowerCase()
    )
  ) || [];

  // Filtered extensions
  const filteredExtensions = enabledProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    // For now, all enabled products are considered "active"
    const matchesStatus = statusFilter === "all" || statusFilter === "active";

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories with proper labels
  const categoryLabels: Record<string, string> = {
    "knowledge:text": "Text Knowledge",
    "knowledge:html": "HTML Knowledge",
    "knowledge:pdf": "PDF Knowledge",
    "knowledge:csv": "CSV Knowledge",
    "knowledge:url": "URL Knowledge",
    "promptset": "Prompt Set",
    "tool:rpc": "RPC Tool",
    "mcp": "MCP",
    "tool:rs": "Rust Tool",
    "tool:js": "JavaScript Tool",
    "tool:py": "Python Tool"
  };

  const categories = [...new Set(enabledProducts.map(p => p.category))];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'knowledge:text':
        return 'FileText' as const;
      case 'knowledge:html':
        return 'Code' as const;
      case 'knowledge:pdf':
        return 'FileText' as const;
      case 'knowledge:csv':
        return 'Database' as const;
      case 'knowledge:url':
        return 'Link' as const;
      case 'promptset':
        return 'MessageSquare' as const;
      case 'tool:rpc':
        return 'Code' as const;
      case 'mcp':
        return 'Server' as const;
      case 'tool:rs':
        return 'Code' as const;
      case 'tool:js':
        return 'Code' as const;
      case 'tool:py':
        return 'Code' as const;
      default:
        return 'Package' as const;
    }
  };

  // Handle extension toggle
  const handleExtensionToggle = async (productId: number, enabled: boolean) => {
    try {
      if (enabled) {
        await api.enableProjectProduct.mutateAsync({
          projectId: parseInt(params.id),
          productId: productId
        });
      } else {
        await api.disableProjectProduct.mutateAsync({
          projectId: parseInt(params.id),
          productId: productId
        });
      }

      // Refresh project products
      refetchProjectProducts();
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to toggle product:', error);
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    // Changes are already saved when toggling, so just close the dialog
    setHasChanges(false);
    setSaveDialogOpen(false);
  };

  // Handle edit agent
  const handleEdit = async () => {
    try {
      if (!project || !agentName) return;
      await api.updateProject.mutateAsync({
        id: project.id,
        updates: {
          name: agentName
        }
      });
      setEditOpen(false);
      setAgentName("");
      refetchProject();
    } catch (error) {
      console.error(error);
    }
  };

  // Handle delete agent
  const handleDelete = async () => {
    try {
      if (!project) return;
      await api.deleteProject.mutateAsync(project.id);
      setDeleteAgent(null);
      // Redirect to agents list
      window.location.href = '/dashboard/agents';
    } catch (error) {
      console.error(error);
    }
  };

  // Project members management functions
  const handleAddProjectMember = async () => {
    if (!project) {
      toast.error('No project selected');
      return;
    }

    if (!newProjectMemberAddress.trim()) {
      toast.error('Please enter a valid wallet address');
      return;
    }

    try {
      await api.addProjectMember.mutateAsync({
        projectId: project.id,
        address: newProjectMemberAddress.trim(),
        role: newProjectMemberRole
      });
      
      setNewProjectMemberAddress("");
      setNewProjectMemberRole("viewer");
      setIsAddProjectMemberDialogOpen(false);
      await refetchProjectMembers();
    } catch (error) {
      console.error('Failed to add project member:', error);
      // Error handling is already done in the mutation hooks
    }
  };

  const handleUpdateProjectMemberRole = async (address: string, newRole: "admin" | "developer" | "viewer") => {
    if (!project) {
      toast.error('No project selected');
      return;
    }

    try {
      await api.updateProjectMemberRole.mutateAsync({
        projectId: project.id,
        address,
        role: newRole
      });
      await refetchProjectMembers();
    } catch (error) {
      console.error('Failed to update project member role:', error);
      // Error handling is already done in the mutation hooks
    }
  };

  const handleRemoveProjectMember = async (address: string) => {
    if (!project) {
      toast.error('No project selected');
      return;
    }

    try {
      await api.removeProjectMember.mutateAsync({
        projectId: project.id,
        address
      });
      await refetchProjectMembers();
    } catch (error) {
      console.error('Failed to remove project member:', error);
      // Error handling is already done in the mutation hooks
    }
  };

  // Telegram token management functions
  const handleSetTelegramToken = async () => {
    if (!project) {
      toast.error('No project selected');
      return;
    }

    try {
      await api.setTelegramToken.mutateAsync({
        projectId: project.id,
        token: telegramToken.trim() || null
      });
      
      setTelegramToken("");
      refetchProject();
    } catch (error) {
      console.error('Failed to set Telegram token:', error);
      // Error handling is already done in the mutation hooks
    }
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <DashboardHeader
          title={project.name}
          subtitle="Manage your agent"
          iconName="Settings"
        />

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/dashboard/agents">
              <Icon name="ArrowLeft" className="" />
              <p className="hidden md:block">Back to Agents</p>
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to="/dashboard/agents/$id/chat" params={{ id: project.id.toString() }}>
              <Icon name="BotMessageSquare" className="" />
              <p className="hidden md:block">Chat with Agent</p>
            </Link>
          </Button>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Icon name="Info" className="size-4" />
              <p className="hidden md:block">Overview</p>
            </TabsTrigger>
            <TabsTrigger value="extensions" className="flex items-center gap-2">
              <Icon name="Package" className="size-4" />
              <p className="hidden md:block">Extensions</p>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Icon name="Users" className="size-4" />
              <p className="hidden md:block">Members</p>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Icon name="Code" className="size-4" />
              <p className="hidden md:block">API Specs</p>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Agent Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon name="Bot" className="size-5" />
                    Agent Information
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setAgentName(project.name);
                        setEditOpen(true);
                      }}
                    >
                      <Icon name="Pencil" className="size-4" />
                      <span className="hidden md:block">Edit Agent</span>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteAgent(project)}
                        >
                          <Icon name="Trash2" className="size-4" />
                          <span className="hidden md:block">Delete Agent</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{project.name}"? This action cannot be undone and will permanently remove the agent and all its associated data.
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
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Project ID</p>
                    <p className="text-sm">{project.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="text-sm">{new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Enabled Extensions</p>
                    <p className="text-sm">{projectProductIds?.length || 0} of {enabledProducts.length}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Search Enabled</p>
                      <p className="text-sm text-muted-foreground">Web search capabilities</p>
                      <Badge variant="secondary" className="text-xs">Unavailable</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={project.search_enabled || false}
                        onCheckedChange={async (checked) => {
                          try {
                            await api.updateProject.mutateAsync({
                              id: project.id,
                              updates: {
                                search_enabled: checked
                              }
                            });
                            refetchProject();
                          } catch (error) {
                            console.error(error);
                          }
                        }}
                        disabled={true}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Memory Enabled</p>
                      <p className="text-sm text-muted-foreground">Conversation memory</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={project.memory_enabled || false}
                        onCheckedChange={async (checked) => {
                          try {
                            await api.updateProject.mutateAsync({
                              id: project.id,
                              updates: {
                                memory_enabled: checked
                              }
                            });
                            refetchProject();
                          } catch (error) {
                            console.error(error);
                          }
                        }}
                        disabled={api.updateProject.isPending}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Telegram Integration */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Telegram Integration</p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="telegram-token" className="text-sm">Bot Token</Label>
                      <Input
                        id="telegram-token"
                        placeholder={project.teloxide_token || "e.g. 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"}
                        value={telegramToken}
                        onChange={e => setTelegramToken(e.target.value)}
                        className="font-mono text-sm mt-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        You can get a bot token from @BotFather on Telegram.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleSetTelegramToken}
                        disabled={api.setTelegramToken.isPending}
                      >
                        {api.setTelegramToken.isPending ? (
                          <>
                            Saving...
                          </>
                        ) : (
                          'Save Token'
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTelegramToken("");
                          handleSetTelegramToken();
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extensions Tab */}
          <TabsContent value="extensions" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {categoryLabels[category] || category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Extensions Grid */}
            {filteredExtensions.length === 0 ? (
              <div className="text-center py-16">
                <Icon name="Package" className="size-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {enabledProducts.length === 0
                    ? "No products are currently enabled for this organization."
                    : "No enabled products match your current filters."
                  }
                </p>
                {enabledProducts.length === 0 && (
                  <Button onClick={() => window.location.href = '/marketplace'}>
                    Browse Marketplace
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExtensions.map((product) => {
                  const priceInUsd = product.price_per_call / 1e18; // Convert from wei to USDT
                  const categoryIcon = getCategoryIcon(product.category);
                  const isEnabled = projectProductIds?.includes(product.id) || false;
                  const isActive = true; // All enabled products are considered active

                  return (
                    <Card key={product.id} className={`relative ${!isActive ? 'opacity-60' : ''}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-gradient-to-br from-primary/5 to-primary/2 flex items-center justify-center border border-primary/20">
                              <Icon name={categoryIcon} className="size-5 text-primary" />
                            </div>
                            <span>{product.name}</span>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => {
                              handleExtensionToggle(product.id, checked);
                              setHasChanges(true);
                            }}
                            disabled={!isActive || api.enableProjectProduct.isPending || api.disableProjectProduct.isPending}
                          />
                        </CardTitle>
                        <CardDescription>Product ID: {product.id}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{categoryLabels[product.category] || product.category}</Badge>
                          <span className="text-sm font-medium text-primary">{priceInUsd.toFixed(6)} USDT</span>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Product ID:</span>
                            <span className="font-medium">{product.id}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="font-medium">
                              {new Date(product.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Creator:</span>
                            <span className="font-medium font-mono text-xs">
                              {product.creator.slice(0, 6)}...{product.creator.slice(-4)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Address:</span>
                            <span className="font-medium font-mono text-xs">
                              {product.address.slice(0, 6)}...{product.address.slice(-4)}
                            </span>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Status:</p>
                          <div className="flex items-center gap-2">
                            {isEnabled ? (
                              <>
                                <Icon name="Check" className="size-3 text-green-500" />
                                <span className="text-sm text-muted-foreground">Enabled for this agent</span>
                              </>
                            ) : (
                              <>
                                <Icon name="X" className="size-3 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Not enabled for this agent</span>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">Project Members</h2>
                <p className="text-muted-foreground text-sm">
                  Manage who has access to this agent and their permissions.
                </p>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Current Members</CardTitle>
                      <CardDescription className="text-sm">
                        {projectMembers?.length || 0} member{projectMembers?.length !== 1 ? 's' : ''} in this project
                      </CardDescription>
                    </div>
                    <Dialog open={isAddProjectMemberDialogOpen} onOpenChange={setIsAddProjectMemberDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                          <Icon name="Plus" className="size-4" />
                          Add Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Project Member</DialogTitle>
                          <DialogDescription>
                            Add a new member to this project by their wallet address.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="project-member-address">Wallet Address</Label>
                            <Input
                              id="project-member-address"
                              placeholder="0x..."
                              value={newProjectMemberAddress}
                              onChange={(e) => setNewProjectMemberAddress(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="project-member-role">Role</Label>
                            <Select value={newProjectMemberRole} onValueChange={(value: "admin" | "developer" | "viewer") => setNewProjectMemberRole(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="developer">Developer</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddProjectMemberDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAddProjectMember}
                            disabled={api.addProjectMember.isPending || !newProjectMemberAddress.trim()}
                          >
                            {api.addProjectMember.isPending ? (
                              <>
                                <Icon name="LoaderCircle" className="size-4 animate-spin mr-2" />
                                Adding...
                              </>
                            ) : (
                              'Add Member'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {projectMembers && projectMembers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Address</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {projectMembers.map((member: any) => (
                          <TableRow key={member.address}>
                            <TableCell className="font-mono text-sm">
                              {member.address.slice(0, 6)}...{member.address.slice(-4)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant={member.role === 'admin' ? 'default' : member.role === 'developer' ? 'secondary' : 'outline'}>
                                  {member.role}
                                </Badge>
                                <Select 
                                  value={member.role} 
                                  onValueChange={(value: "admin" | "developer" | "viewer") => handleUpdateProjectMemberRole(member.address, value)}
                                  disabled={api.updateProjectMemberRole.isPending}
                                >
                                  <SelectTrigger className="w-28 h-7">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                    <SelectItem value="developer">Developer</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                    <Icon name="Trash2" className="size-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {member.address.slice(0, 6)}...{member.address.slice(-4)} from this project? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveProjectMember(member.address)}
                                      disabled={api.removeProjectMember.isPending}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {api.removeProjectMember.isPending ? (
                                        <>
                                          <Icon name="LoaderCircle" className="size-4 animate-spin mr-2" />
                                          Removing...
                                        </>
                                      ) : (
                                        'Remove Member'
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Icon name="Users" className="size-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No members found</p>
                      <p className="text-sm text-muted-foreground">Add your first project member to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Code" className="size-5" />
                  API Documentation
                </CardTitle>
                <CardDescription>
                  Use the following endpoint to interact with your agent via API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Endpoint */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">Endpoint</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono shrink-0">POST</Badge>
                    <Input
                      value={`${process.env.BUN_PUBLIC_RUST_SERVER_URL}/v1beta/openai/chat/completions`}
                      readOnly
                      className="font-mono text-sm flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(
                        `${process.env.BUN_PUBLIC_RUST_SERVER_URL}/v1beta/openai/chat/completions`,
                        "Endpoint",
                        setCopiedField
                      )}
                      className="shrink-0"
                    >
                      <Icon name={copiedField === "Endpoint" ? "Check" : "Copy"} className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Headers */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-muted-foreground">Required Headers</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="w-36 text-sm shrink-0">Authorization</Label>
                      <Input value="Bearer <YOUR-API-KEY>" readOnly className="font-mono text-sm flex-1" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard("Bearer <YOUR-API-KEY>", "Authorization Header", setCopiedField)}
                        className="shrink-0"
                      >
                        <Icon name={copiedField === "Authorization Header" ? "Check" : "Copy"} className="size-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-36 text-sm shrink-0">OpenAI-Organization</Label>
                      <Input value={`org-${organization?.organization_uid}`} readOnly className="font-mono text-sm flex-1" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`org-${organization?.organization_uid}`, "OpenAI-Organization Header", setCopiedField)}
                        className="shrink-0"
                      >
                        <Icon name={copiedField === "OpenAI-Organization Header" ? "Check" : "Copy"} className="size-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-36 text-sm shrink-0">OpenAI-Project</Label>
                      <Input value={`proj-${project.project_uid}`} readOnly className="font-mono text-sm flex-1" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`proj-${project.project_uid}`, "OpenAI-Project Header", setCopiedField)}
                        className="shrink-0"
                      >
                        <Icon name={copiedField === "OpenAI-Project Header" ? "Check" : "Copy"} className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Request Body */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-muted-foreground">Example Request Body (JSON)</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`{
  "model": "gemini-2.0-flash",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how can you help me today?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "n": 1,
}`, "Request Body JSON", setCopiedField)}
                      className="shrink-0"
                    >
                      <Icon name={copiedField === "Request Body JSON" ? "Check" : "Copy"} className="size-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={`{
  "model": "gemini-2.0-flash",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how can you help me today?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "n": 1,
}`}
                    readOnly
                    className="font-mono text-sm h-48"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Save Changes Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Configuration Changes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
              <Icon name="Info" className="size-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm">
                You're about to update the configuration for <strong>{project.name}</strong>.
                This will enable/disable the selected products for this agent.
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Changes to be applied:</p>
              <div className="text-sm text-muted-foreground">
                {projectProductIds?.length || 0} extensions will be enabled
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>
              Save Changes
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                placeholder="Agent name"
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!agentName || api.updateProject.isPending}>
              {api.updateProject.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
}