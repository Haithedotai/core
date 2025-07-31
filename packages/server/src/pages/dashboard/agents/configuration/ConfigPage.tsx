import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Switch } from "@/src/lib/components/ui/switch";
import { Input } from "@/src/lib/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import { Separator } from "@/src/lib/components/ui/separator";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useStore } from "@/src/lib/hooks/use-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/lib/components/ui/dialog";

export default function AgentsConfigurationPage() {
  const params = useParams({ from: "/dashboard/agents/$id" });
  const api = useHaitheApi();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Get profile data
  const profileQuery = api.profile();
  const orgId = useStore((s) => s.selectedOrganizationId);
  const { data: project, isLoading: isLoadingProject } = api.getProject(parseInt(params.id));

  console.log({ project });
  
  // Get organization data
  const { data: organization } = api.getOrganization(orgId);
  
  // Get enabled products for the organization
  const { data: enabledProductAddresses, isLoading: isLoadingEnabledProducts, refetch: refetchEnabledProducts } = api.getEnabledProducts(organization?.address || "");
  
  // Get all products to match with enabled addresses
  const { data: allProducts, isLoading: isLoadingAllProducts } = api.getAllProducts();
  
  // Get project-specific enabled products
  const { data: projectProductIds, isLoading: isLoadingProjectProducts, refetch: refetchProjectProducts } = api.getProjectProducts(parseInt(params.id));

  // Loading state
  if (profileQuery.isPending || isLoadingProject || isLoadingEnabledProducts || isLoadingAllProducts || isLoadingProjectProducts || !api.isClientInitialized()) {
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

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="space-y-3 flex items-center w-full justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="aspect-square size-12 md:size-16 rounded-lg bg-gradient-to-br from-primary/5 to-primary/2 flex items-center justify-center border border-primary/20">
                  <Icon name="Settings" className="size-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                      {project.name}
                    </h1>
                    <Badge variant="default">
                      Active
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl">
                    Manage your agent
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" asChild>
                  <Link to="/dashboard/agents">
                    <Icon name="ArrowLeft" className="" />
                    <p className="hidden md:block ml-2">Back to Agents</p>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Agent Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Bot" className="size-5" />
              Agent Information
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
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
              const priceInUsd = product.price_per_call / 1e18; // Convert from wei to USD
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
                      <span className="text-sm font-medium text-primary">{priceInUsd.toFixed(6)} USD</span>
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
    </div>
  );
}