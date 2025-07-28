import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Input } from "@/src/lib/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import { Separator } from "@/src/lib/components/ui/separator";
import Icon from "@/src/lib/components/custom/Icon";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { useStore } from "@/src/lib/hooks/use-store";

// Mock data for installed marketplace extensions
const mockInstalledExtensions = [
  {
    id: "ext_1",
    name: "Customer Support Knowledge Base",
    description: "Comprehensive knowledge base for customer support queries",
    category: "knowledge:text",
    status: "active",
    icon: "FileText" as const,
    pricePerCall: "0.001 USDT",
    features: ["Text-based knowledge", "Searchable content", "Easy updates"],
    installedAt: "2024-01-15T10:30:00Z",
    usageCount: 1250,
    lastUsed: "2024-01-20T14:22:00Z",
    totalSpent: "1.25 USDT"
  },
  {
    id: "ext_2", 
    name: "Product Documentation",
    description: "HTML-based product documentation and guides",
    category: "knowledge:html",
    status: "active",
    icon: "Code" as const,
    pricePerCall: "0.002 USDT",
    features: ["HTML formatting", "Rich content", "Structured data"],
    installedAt: "2024-01-10T09:15:00Z",
    usageCount: 890,
    lastUsed: "2024-01-19T16:45:00Z",
    totalSpent: "1.78 USDT"
  },
  {
    id: "ext_3",
    name: "Sales Training Manual",
    description: "PDF-based sales training and best practices",
    category: "knowledge:pdf",
    status: "active",
    icon: "FileText" as const,
    pricePerCall: "0.003 USDT",
    features: ["PDF format", "Professional layout", "Print-ready"],
    installedAt: "2024-01-08T11:20:00Z",
    usageCount: 567,
    lastUsed: "2024-01-18T10:30:00Z",
    totalSpent: "1.701 USDT"
  },
  {
    id: "ext_4",
    name: "Customer Data Analysis",
    description: "CSV dataset for customer behavior analysis",
    category: "knowledge:csv",
    status: "active",
    icon: "Database" as const,
    pricePerCall: "0.0015 USDT",
    features: ["Structured data", "Analytics ready", "Easy import"],
    installedAt: "2024-01-12T13:45:00Z",
    usageCount: 234,
    lastUsed: "2024-01-17T08:15:00Z",
    totalSpent: "0.351 USDT"
  },
  {
    id: "ext_5",
    name: "Web Scraping Tool",
    description: "RPC tool for scraping website data",
    category: "tool:rpc",
    status: "active", 
    icon: "Code" as const,
    pricePerCall: "0.005 USDT",
    features: ["HTTP requests", "Data extraction", "API integration"],
    installedAt: "2024-01-05T15:30:00Z",
    usageCount: 1890,
    lastUsed: "2024-01-20T12:00:00Z",
    totalSpent: "9.45 USDT"
  },
  {
    id: "ext_6",
    name: "Conversation Prompts",
    description: "Optimized prompts for customer interactions",
    category: "promptset",
    status: "active",
    icon: "Code" as const,
    pricePerCall: "0.002 USDT",
    features: ["Multiple prompts", "Context-aware", "Customizable"],
    installedAt: "2024-01-03T14:20:00Z",
    usageCount: 3456,
    lastUsed: "2024-01-20T18:30:00Z",
    totalSpent: "6.912 USDT"
  },
  {
    id: "ext_7",
    name: "External API Integration",
    description: "RPC tool for integrating with third-party services",
    category: "tool:rpc",
    status: "inactive",
    icon: "Code" as const,
    pricePerCall: "0.004 USDT",
    features: ["REST API", "Authentication", "Error handling"],
    installedAt: "2024-01-01T10:00:00Z",
    usageCount: 123,
    lastUsed: "2024-01-10T09:45:00Z",
    totalSpent: "0.492 USDT"
  },
  {
    id: "ext_8",
    name: "Technical Support Guide",
    description: "Comprehensive technical troubleshooting guide",
    category: "knowledge:text",
    status: "active",
    icon: "FileText" as const,
    pricePerCall: "0.001 USDT",
    features: ["Step-by-step guides", "Troubleshooting tips", "FAQ section"],
    installedAt: "2024-01-14T16:30:00Z",
    usageCount: 678,
    lastUsed: "2024-01-20T11:20:00Z",
    totalSpent: "0.678 USDT"
  }
];

export default function PurchasesPage() {
  const api = useHaitheApi();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get profile data
  const profileQuery = api.profile();
  const orgId = useStore((s) => s.selectedOrganizationId);

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
          <Icon name="ShoppingBag" className="size-16 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Authentication Required</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please log in to view your purchases.
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

  // Calculate total spent
  const totalSpent = mockInstalledExtensions.reduce((total, extension) => {
    return total + parseFloat(extension.totalSpent.split(' ')[0]);
  }, 0);

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
                  <Icon name="ShoppingBag" className="size-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    Extensions
                  </h1>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                    View your installed marketplace extensions and usage
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline">
                  <Icon name="Download" className="mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Installed Extensions</CardTitle>
              <Icon name="Package" className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockInstalledExtensions.length}</div>
              <p className="text-xs text-muted-foreground">
                From marketplace
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage Cost</CardTitle>
              <Icon name="Coins" className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSpent.toFixed(4)} USDT</div>
              <p className="text-xs text-muted-foreground">
                From agent calls
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Items</CardTitle>
              <Icon name="CircleCheck" className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockInstalledExtensions.filter(p => p.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search extensions..."
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
              const isActive = extension.status === "active";
              
              return (
                <Card key={extension.id} className={`relative ${!isActive ? 'opacity-60' : ''}`}>
                  {!isActive && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-gradient-to-br from-primary/5 to-primary/2 flex items-center justify-center border border-primary/20">
                          <Icon name={extension.icon} className="size-5 text-primary" />
                        </div>
                        <span>{extension.name}</span>
                      </div>
                    </CardTitle>
                    <CardDescription>{extension.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{categoryLabels[extension.category] || extension.category}</Badge>
                      <span className="text-sm font-medium text-primary">{extension.pricePerCall}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Usage Count:</span>
                        <span className="font-medium">{extension.usageCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Used:</span>
                        <span className="font-medium">
                          {new Date(extension.lastUsed).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Installed:</span>
                        <span className="font-medium">
                          {new Date(extension.installedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Spent:</span>
                        <span className="font-medium text-primary">{extension.totalSpent}</span>
                      </div>
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
    </div>
  );
} 