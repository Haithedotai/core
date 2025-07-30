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


// Mock data for installed marketplace extensions
const mockInstalledExtensions = [
  {
    id: "ext_1",
    name: "Customer Support Knowledge Base",
    description: "Comprehensive knowledge base for customer support queries",
    category: "knowledge:text",
    status: "active",
    enabled: true,
    icon: "FileText" as const,
    pricePerCall: "0.001 USDT",
    features: ["Text-based knowledge", "Searchable content", "Easy updates"]
  },
  {
    id: "ext_2",
    name: "Product Documentation",
    description: "HTML-based product documentation and guides",
    category: "knowledge:html",
    status: "active",
    enabled: false,
    icon: "Code" as const,
    pricePerCall: "0.002 USDT",
    features: ["HTML formatting", "Rich content", "Structured data"]
  },
  {
    id: "ext_3",
    name: "Sales Training Manual",
    description: "PDF-based sales training and best practices",
    category: "knowledge:pdf",
    status: "active",
    enabled: true,
    icon: "FileText" as const,
    pricePerCall: "0.003 USDT",
    features: ["PDF format", "Professional layout", "Print-ready"]
  },
  {
    id: "ext_4",
    name: "Customer Data Analysis",
    description: "CSV dataset for customer behavior analysis",
    category: "knowledge:csv",
    status: "active",
    enabled: false,
    icon: "Database" as const,
    pricePerCall: "0.0015 USDT",
    features: ["Structured data", "Analytics ready", "Easy import"]
  },
  {
    id: "ext_5",
    name: "Web Scraping Tool",
    description: "RPC tool for scraping website data",
    category: "tool:rpc",
    status: "active",
    enabled: false,
    icon: "Code" as const,
    pricePerCall: "0.005 USDT",
    features: ["HTTP requests", "Data extraction", "API integration"]
  },
  {
    id: "ext_6",
    name: "Conversation Prompts",
    description: "Optimized prompts for customer interactions",
    category: "promptset",
    status: "active",
    enabled: true,
    icon: "Code" as const,
    pricePerCall: "0.002 USDT",
    features: ["Multiple prompts", "Context-aware", "Customizable"]
  },
  {
    id: "ext_7",
    name: "External API Integration",
    description: "RPC tool for integrating with third-party services",
    category: "tool:rpc",
    status: "inactive",
    enabled: false,
    icon: "Code" as const,
    pricePerCall: "0.004 USDT",
    features: ["REST API", "Authentication", "Error handling"]
  }
];

// Mock agent data
const mockAgent = {
  id: "agent_123",
  name: "Customer Support Agent",
  description: "AI-powered customer support agent for e-commerce",
  status: "active",
  created_at: "2024-01-15T10:30:00Z",
  project_uid: "proj_abc123",
  enabled_products: ["prod_1", "prod_3"]
};

export default function AgentsConfigurationPage() {
  const params = useParams({ from: "/dashboard/agents/$id" });
  const api = useHaitheApi();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [enabledExtensions, setEnabledExtensions] = useState<string[]>(mockAgent.enabled_products);
  const [hasChanges, setHasChanges] = useState(false);

  // Get profile data
  const profileQuery = api.profile();
  const orgId = useStore((s) => s.selectedOrganizationId);
  const { data: project, isLoading: isLoadingProject } = api.getProject(parseInt(params.id));
  console.log({ project });

  // Loading state
  if (profileQuery.isPending) {
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

  // Filtered extensions
  const filteredExtensions = mockInstalledExtensions.filter((extension) => {
    const matchesSearch = extension.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extension.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || extension.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || extension.status === statusFilter;

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

  const categories = [...new Set(mockInstalledExtensions.map(p => p.category))];

  // Handle extension toggle
  const handleExtensionToggle = (extensionId: string, enabled: boolean) => {
    const newEnabledExtensions = enabled
      ? [...enabledExtensions, extensionId]
      : enabledExtensions.filter(id => id !== extensionId);

    setEnabledExtensions(newEnabledExtensions);
    setHasChanges(true);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    // Mock API call
    console.log("Saving configuration for agent:", params.id);
    console.log("Enabled extensions:", enabledExtensions);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

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
                <div className="size-16 rounded-lg bg-gradient-to-br from-primary/5 to-primary/2 flex items-center justify-center border border-primary/20">
                  <Icon name="Settings" className="size-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                      {mockAgent.name}
                    </h1>
                    <Badge variant={mockAgent.status === "active" ? "default" : "secondary"}>
                      {mockAgent.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                    Configure products and features for this agent
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" asChild>
                  <Link to="/dashboard/agents">
                    <Icon name="ArrowLeft" className="mr-2" />
                    Back to Agents
                  </Link>
                </Button>
                <Button
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={!hasChanges}
                >
                  <Icon name="Save" className="mr-2" />
                  Save Changes
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
                <p className="text-sm font-medium text-muted-foreground">Agent ID</p>
                <p className="text-sm">{mockAgent.project_uid}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p className="text-sm">{new Date(mockAgent.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enabled Extensions</p>
                <p className="text-sm">{enabledExtensions.length} of {mockInstalledExtensions.length}</p>
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
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Extensions Grid */}
        {filteredExtensions.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="Package" className="size-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No extensions found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              No installed extensions match your current filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExtensions.map((extension) => {
              const isEnabled = enabledExtensions.includes(extension.id);
              const isActive = extension.status === "active";

              return (
                <Card key={extension.id} className={`relative ${!isActive ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-gradient-to-br from-primary/5 to-primary/2 flex items-center justify-center border border-primary/20">
                          <Icon name={extension.icon} className="size-5 text-primary" />
                        </div>
                        <span>{extension.name}</span>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleExtensionToggle(extension.id, checked)}
                        disabled={!isActive}
                      />
                    </CardTitle>
                    <CardDescription>{extension.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{categoryLabels[extension.category] || extension.category}</Badge>
                      <span className="text-sm font-medium text-primary">{extension.pricePerCall}</span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Features:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {extension.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <Icon name="Check" className="size-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
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
                You're about to update the configuration for <strong>{mockAgent.name}</strong>.
                This will enable/disable the selected products for this agent.
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Changes to be applied:</p>
              <div className="text-sm text-muted-foreground">
                {enabledExtensions.length} extensions will be enabled
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