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

export default function PurchasesPage() {
  const api = useHaitheApi();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { mutate: disableProduct, isPending: isDisablingProduct } = api.disableProduct;

  // Get organization data
  const orgId = useStore((s) => s.selectedOrganizationId);
  const { data: organization } = api.getOrganization(orgId);

  // Get enabled products for the organization
  const { data: enabledProductAddresses, isLoading: isLoadingEnabledProducts, refetch: refetchEnabledProducts } = api.getEnabledProducts(organization?.address || "");

  // Get all products to match with enabled addresses
  const { data: allProducts, isLoading: isLoadingAllProducts } = api.getAllProducts();

  // Get organization balance and expenditure
  const { data: organizationBalance, isLoading: isLoadingBalance } = api.balance(orgId);
  const { data: organizationExpenditure, isLoading: isLoadingExpenditure } = api.getOrganizationExpenditure(orgId);

  // Loading state
  if (isLoadingEnabledProducts || isLoadingAllProducts || isLoadingBalance || isLoadingExpenditure || !api.isClientInitialized()) {
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

  if (!organization) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icon name="Building" className="size-16 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-medium">No Organization Selected</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please select an organization to view enabled products.
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

  // Format balance and expenditure values
  const formatBalance = (balanceData: { balance: number } | undefined) => {
    if (!balanceData) return "0.00";
    return (balanceData.balance / 1e18).toFixed(6);
  };

  const formatExpenditure = (expenditureData: { expenditure: number } | undefined) => {
    if (!expenditureData) return "0.00";
    return (expenditureData.expenditure / 1e18).toFixed(6);
  };

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

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0" />
        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="space-y-3 flex items-center w-full justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-16 aspect-square rounded-lg bg-gradient-to-br from-primary/5 to-primary/2 flex items-center justify-center border border-primary/20">
                  <Icon name="ShoppingBag" className="size-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    Enabled Products
                  </h1>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
                    View your organization's enabled marketplace products
                  </p>
                </div>
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
              <CardTitle className="text-sm font-medium">Organization Balance</CardTitle>
              <Icon name="Wallet" className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBalance(organizationBalance)} USDT</div>
              <p className="text-xs text-muted-foreground">
                Available funds
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenditure</CardTitle>
              <Icon name="TrendingDown" className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatExpenditure(organizationExpenditure)} USDT</div>
              <p className="text-xs text-muted-foreground">
                Total spent to date
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enabled Products</CardTitle>
              <Icon name="Package" className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enabledProducts.length}</div>
              <p className="text-xs text-muted-foreground">
                From marketplace
              </p>
            </CardContent>
          </Card>
        </div>

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

        {/* Products Grid */}
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

              return (
                <Card key={product.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-gradient-to-br from-primary/5 to-primary/2 flex items-center justify-center border border-primary/20">
                          <Icon name={categoryIcon} className="size-5 text-primary" />
                        </div>
                        <span>{product.name}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        disableProduct({ product_address: product.address, org_address: organization.address }, {
                          onSuccess: () => {
                            refetchEnabledProducts();
                          }
                        })
                      }} disabled={isDisablingProduct} className="flex items-center gap-2">
                        {isDisablingProduct ? <Icon name="LoaderCircle" className="size-4 animate-spin" /> : "Disable"}
                      </Button>
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
                        <Icon name="Check" className="size-3 text-green-500" />
                        <span className="text-sm text-muted-foreground">Enabled for organization</span>
                      </div>
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