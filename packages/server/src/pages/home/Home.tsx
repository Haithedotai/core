import { useState, useMemo, useEffect } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Avatar } from "@/src/lib/components/ui/avatar";
import { Separator } from "@/src/lib/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/lib/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { mockModels } from "@/src/lib/data/mockModels";
import { useAppStore } from "@/src/lib/stores/useAppStore";
import type { MarketplaceItem, MarketplaceFilters, ItemType } from "@/src/lib/types";

const ITEMS_PER_PAGE = 6;

const ITEM_TYPES: { value: ItemType; label: string; icon: string; description: string }[] = [
  { value: 'knowledge_base', label: 'Knowledge Bases', icon: 'Brain', description: 'Pre-trained AI knowledge systems' },
  { value: 'tool', label: 'Tools', icon: 'Wrench', description: 'AI-powered functions and utilities' },
  { value: 'mcp', label: 'MCPs', icon: 'Wifi', description: 'Model Context Protocols' },
  { value: 'prompt_set', label: 'Prompt Sets', icon: 'MessageSquare', description: 'Curated conversation prompts' },
];

const VALIDATION_STATUSES = [
  { value: 'certified', label: 'Certified', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'unvalidated', label: 'Unvalidated', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
];

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  onPurchase: (item: MarketplaceItem) => void;
}

function MarketplaceItemCard({ item, onPurchase }: MarketplaceItemCardProps) {
  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'knowledge_base': return <Icon name="Brain" className="size-4 text-foreground" />;
      case 'tool': return <Icon name="Wrench" className="size-4 text-foreground" />;
      case 'mcp': return <Icon name="Wifi" className="size-4 text-foreground" />;
      case 'prompt_set': return <Icon name="MessageSquare" className="size-4 text-foreground" />;
      default: return <Icon name="Package" className="size-4 text-foreground" />;
    }
  };

  const getValidationStatusColor = (status: string) => {
    const validationStatus = VALIDATION_STATUSES.find(s => s.value === status);
    return validationStatus?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group p-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-muted">
              {getItemTypeIcon(item.type)}
            </div>
            <div className="flex flex-col flex-1">
              <CardTitle className="text-lg leading-relaxed line-clamp-2 group-hover:text-primary transition-colors mb-2">
                {item.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {ITEM_TYPES.find(t => t.value === item.type)?.label}
                </Badge>
                <Badge className={`text-xs ${getValidationStatusColor(item.validation_status)}`}>
                  {item.validation_status === 'certified' && <Icon name="ShieldCheck" className="size-3 mr-1" />}
                  {VALIDATION_STATUSES.find(s => s.value === item.validation_status)?.label}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary mb-1">
              {formatPrice(item.price, item.currency)}
            </p>
            {item.rating > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Icon name="Star" className="size-3 fill-yellow-400 text-yellow-400" />
                <span>{item.rating.toFixed(1)}</span>
                <span>({item.reviews_count})</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="line-clamp-3 mb-6 leading-relaxed">
          {item.description}
        </CardDescription>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {item.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{item.tags.length - 3} more
            </Badge>
          )}
        </div>

        <Separator className="mb-6" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icon name="Download" className="size-3" />
              <span>{item.downloads}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Calendar" className="size-3" />
              <span>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Icon name="Eye" className="size-4 mr-2" />
              View
            </Button>
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onPurchase(item);
              }}
              className="hover:bg-primary/90"
            >
              <Icon name="ShoppingCart" className="size-4 mr-2" />
              Buy Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
    const { fetchMarketplaceItems, purchaseItem, currentUser, currentOrganization } = useAppStore();
    const [activeTab, setActiveTab] = useState("models");
    
    // Models state
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Marketplace state
    const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
    const [marketplaceLoading, setMarketplaceLoading] = useState(true);
    const [marketplaceSearchQuery, setMarketplaceSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
    const [filters, setFilters] = useState<MarketplaceFilters>({
        search: '',
        validation_status: ['certified'],
        sort_by: 'rating',
        sort_order: 'desc',
    });

    // Load marketplace items when filters change
    useEffect(() => {
        if (activeTab === "marketplace") {
            loadMarketplaceItems();
        }
    }, [filters, activeTab]);

    const loadMarketplaceItems = async () => {
        setMarketplaceLoading(true);
        try {
            const response = await fetchMarketplaceItems(filters);
            setMarketplaceItems(response.data);
        } catch (error) {
            console.error('Failed to load marketplace items:', error);
        } finally {
            setMarketplaceLoading(false);
        }
    };

    // Filter models based on search query
    const filteredModels = useMemo(() => {
        if (!searchQuery.trim()) return mockModels;

        const query = searchQuery.toLowerCase();
        return mockModels.filter(model =>
            model.name.toLowerCase().includes(query) ||
            model.description.toLowerCase().includes(query) ||
            model.tags.some(tag => tag.toLowerCase().includes(query)) ||
            model.creator.name.toLowerCase().includes(query) ||
            model.type.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    // Paginate filtered results
    const paginatedModels = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredModels.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredModels, currentPage]);

    const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);

    // Reset to first page when search changes
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handleMarketplaceSearch = (query: string) => {
        setMarketplaceSearchQuery(query);
        setFilters(prev => ({ ...prev, search: query }));
    };

    const handleTypeFilter = (type: string) => {
        const newType = type as ItemType | 'all';
        setSelectedType(newType);
        setFilters(prev => ({
            ...prev,
            type: newType === 'all' ? undefined : [newType]
        }));
    };

    const handlePurchase = async (item: MarketplaceItem) => {
        if (!currentUser || !currentOrganization) {
            alert('Please connect your wallet and select an organization to make a purchase');
            return;
        }

        try {
            await purchaseItem(item.id, currentOrganization.id);
            alert(`Successfully purchased ${item.name}!`);
            loadMarketplaceItems(); // Refresh to update download count
        } catch (error) {
            alert('Failed to complete purchase. Please try again.');
        }
    };

    const filteredItemsByType = selectedType === 'all' 
        ? marketplaceItems 
        : marketplaceItems.filter(item => item.type === selectedType);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "maintenance": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
            case "deprecated": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-grey-100 text-grey-800 dark:bg-grey-900/30 dark:text-grey-400";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-full bg-background">
            {/* Header Section */}
            <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-foreground">
                                {activeTab === "models" ? "Browse Models" : "Marketplace"}
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                {activeTab === "models" 
                                    ? "Discover and explore context-aware models created by our community"
                                    : "Discover and purchase AI tools, knowledge bases, and protocols"
                                }
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-md">
                            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder={activeTab === "models" ? "Search models, creators, or tags..." : "Search marketplace items..."}
                                value={activeTab === "models" ? searchQuery : marketplaceSearchQuery}
                                onChange={(e) => activeTab === "models" ? handleSearch(e.target.value) : handleMarketplaceSearch(e.target.value)}
                                className="pl-10 bg-background/80"
                            />
                        </div>

                        {/* Results Summary */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                                {activeTab === "models" 
                                    ? `${filteredModels.length} model${filteredModels.length !== 1 ? 's' : ''} found`
                                    : `${marketplaceItems.length} item${marketplaceItems.length !== 1 ? 's' : ''} found`
                                }
                            </span>
                            {((activeTab === "models" && searchQuery) || (activeTab === "marketplace" && marketplaceSearchQuery)) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => activeTab === "models" ? handleSearch("") : handleMarketplaceSearch("")}
                                    className="text-primary hover:text-primary/80"
                                >
                                    Clear search
                                </Button>
                            )}
                        </div>

                        {/* Marketplace Filters */}
                        {activeTab === "marketplace" && (
                            <div className="flex flex-col @sm/main:flex-row gap-6">
                                <div className="flex gap-3">
                                    <Select 
                                        value={filters.sort_by} 
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, sort_by: value as any }))}
                                    >
                                        <SelectTrigger className="w-48 h-12">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rating">Top Rated</SelectItem>
                                            <SelectItem value="downloads">Most Popular</SelectItem>
                                            <SelectItem value="price">Price</SelectItem>
                                            <SelectItem value="created_at">Newest</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    
                                    <Button
                                        variant="outline"
                                        size="default"
                                        className="h-12 px-4"
                                        onClick={() => setFilters(prev => ({
                                            ...prev,
                                            sort_order: prev.sort_order === 'asc' ? 'desc' : 'asc'
                                        }))}
                                    >
                                        {filters.sort_order === 'asc' ? (
                                            <Icon name="ArrowUp" className="size-4" />
                                        ) : (
                                            <Icon name="ArrowDown" className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="models" className="flex items-center gap-2">
                            <Icon name="Brain" className="h-4 w-4" />
                            Models
                        </TabsTrigger>
                        <TabsTrigger value="marketplace" className="flex items-center gap-2">
                            <Icon name="ShoppingCart" className="h-4 w-4" />
                            Marketplace
                        </TabsTrigger>
                    </TabsList>

                    {/* Models Tab */}
                    <TabsContent value="models" className="mt-0">
                        {paginatedModels.length === 0 ? (
                            <div className="text-center py-16">
                                <Icon name="Brain" className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">No models found</h3>
                                <p className="text-muted-foreground">
                                    {searchQuery
                                        ? "Try adjusting your search criteria or browse all models"
                                        : "No models available at the moment"
                                    }
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 @3xl/main:grid-cols-2 gap-6">
                                {paginatedModels.map((model) => (
                                    <Card key={model.id} className="group hover:shadow-lg transition-all duration-200 border-border bg-card">
                                        <div className="p-6">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                            {model.name}
                                                        </h3>
                                                        <Badge className={getStatusColor(model.status)} variant="secondary">
                                                            {model.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-primary/80 font-medium">{model.type}</p>
                                                </div>
                                                <Link to="/model/$id" params={{ id: model.id }}>
                                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Icon name="ExternalLink" className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>

                                            {/* Description */}
                                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                                {model.description}
                                            </p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {model.tags.slice(0, 3).map((tag) => (
                                                    <Badge key={tag} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {model.tags.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{model.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Icon name="MessageSquare" className="h-3 w-3" />
                                                    {model.usageCount.toLocaleString()} uses
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Icon name="Star" className="h-3 w-3 fill-current" />
                                                    {model.rating}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Icon name="Calendar" className="h-3 w-3" />
                                                    {formatDate(model.createdAt)}
                                                </div>
                                            </div>

                                            {/* Creator */}
                                            <div className="flex items-center gap-2 pt-4 border-t border-border">
                                                <Avatar className="h-6 w-6">
                                                    <div className="h-full w-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                        {model.creator.avatar}
                                                    </div>
                                                </Avatar>
                                                <span className="text-sm text-muted-foreground">{model.creator.name}</span>
                                                {model.creator.verified && (
                                                    <div className="h-3 w-3 bg-primary rounded-full flex items-center justify-center">
                                                        <div className="h-1.5 w-1.5 bg-primary-foreground rounded-full" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "primary" : "ghost"}
                                            size="sm"
                                            onClick={() => setCurrentPage(pageNum)}
                                            className="min-w-[2.5rem]"
                                        >
                                            {pageNum}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* Marketplace Tab */}
                    <TabsContent value="marketplace" className="mt-0">
                        <Tabs value={selectedType} onValueChange={handleTypeFilter} className="w-full">
                            {/* Desktop: Tabs */}
                            <TabsList className="hidden @3xl/main:flex items-center justify-between w-full mb-12 h-12">
                                <TabsTrigger value="all" className="flex items-center text-base">
                                    <Icon name="Grid3x3" className="size-4" />
                                    All Items
                                </TabsTrigger>
                                {ITEM_TYPES.map((type) => (
                                    <TabsTrigger key={type.value} value={type.value} className="flex items-center text-base">
                                        {type.value === 'knowledge_base' && <Icon name="Brain" className="size-4" />}
                                        {type.value === 'tool' && <Icon name="Wrench" className="size-4" />}
                                        {type.value === 'mcp' && <Icon name="Wifi" className="size-4" />}
                                        {type.value === 'prompt_set' && <Icon name="MessageSquare" className="size-4" />}
                                        {type.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            
                            {/* Mobile: Dropdown */}
                            <div className="@3xl/main:hidden mb-8">
                                <Select
                                    value={selectedType}
                                    onValueChange={handleTypeFilter}
                                >
                                    <SelectTrigger className="w-full h-12">
                                        <SelectValue>
                                            {selectedType === "all" ? (
                                                <span className="flex items-center gap-2">
                                                    <Icon name="Grid3x3" className="size-4" />
                                                    All Items
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    {ITEM_TYPES.find(t => t.value === selectedType)?.value === 'knowledge_base' && <Icon name="Brain" className="size-4" />}
                                                    {ITEM_TYPES.find(t => t.value === selectedType)?.value === 'tool' && <Icon name="Wrench" className="size-4" />}
                                                    {ITEM_TYPES.find(t => t.value === selectedType)?.value === 'mcp' && <Icon name="Wifi" className="size-4" />}
                                                    {ITEM_TYPES.find(t => t.value === selectedType)?.value === 'prompt_set' && <Icon name="MessageSquare" className="size-4" />}
                                                    {ITEM_TYPES.find(t => t.value === selectedType)?.label}
                                                </span>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            <span className="flex items-center gap-2">
                                                <Icon name="Grid3x3" className="size-4" />
                                                All Items
                                            </span>
                                        </SelectItem>
                                        {ITEM_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <span className="flex items-center gap-2">
                                                    {type.value === 'knowledge_base' && <Icon name="Brain" className="size-4" />}
                                                    {type.value === 'tool' && <Icon name="Wrench" className="size-4" />}
                                                    {type.value === 'mcp' && <Icon name="Wifi" className="size-4" />}
                                                    {type.value === 'prompt_set' && <Icon name="MessageSquare" className="size-4" />}
                                                    {type.label}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <TabsContent value="all" className="mt-0">
                                <div className="grid grid-cols-1 @4xl/main:grid-cols-2 gap-8">
                                    {marketplaceLoading ? (
                                        Array.from({ length: 6 }).map((_, i) => (
                                            <Card key={i} className="h-80 animate-pulse">
                                                <CardHeader>
                                                    <div className="w-3/4 h-6 bg-muted rounded mb-3"></div>
                                                    <div className="w-1/2 h-4 bg-muted rounded"></div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        <div className="w-full h-4 bg-muted rounded"></div>
                                                        <div className="w-2/3 h-4 bg-muted rounded"></div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : marketplaceItems.length === 0 ? (
                                        <div className="col-span-full text-center py-20 space-y-6">
                                            <Icon name="Search" className="size-20 text-muted-foreground mx-auto" />
                                            <div className="space-y-3">
                                                <h3 className="text-2xl font-semibold text-foreground leading-relaxed">No items found</h3>
                                                <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                                                    Try adjusting your search or filters to find what you're looking for.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        marketplaceItems.map((item) => (
                                            <MarketplaceItemCard
                                                key={item.id}
                                                item={item}
                                                onPurchase={handlePurchase}
                                            />
                                        ))
                                    )}
                                </div>
                            </TabsContent>

                            {ITEM_TYPES.map((type) => (
                                <TabsContent key={type.value} value={type.value} className="mt-0">
                                    <div className="mb-8 p-6 rounded-lg bg-muted/50 border">
                                        <div className="flex items-center gap-4">
                                            {type.value === 'knowledge_base' && <Icon name="Brain" className="size-10 text-primary" />}
                                            {type.value === 'tool' && <Icon name="Wrench" className="size-10 text-primary" />}
                                            {type.value === 'mcp' && <Icon name="Wifi" className="size-10 text-primary" />}
                                            {type.value === 'prompt_set' && <Icon name="MessageSquare" className="size-10 text-primary" />}
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-semibold leading-relaxed">{type.label}</h3>
                                                <p className="text-muted-foreground leading-relaxed">{type.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 @4xl/main:grid-cols-2 gap-8">
                                        {marketplaceLoading ? (
                                            Array.from({ length: 6 }).map((_, i) => (
                                                <Card key={i} className="h-80 animate-pulse">
                                                    <CardHeader>
                                                        <div className="w-3/4 h-6 bg-muted rounded mb-3"></div>
                                                        <div className="w-1/2 h-4 bg-muted rounded"></div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-3">
                                                            <div className="w-full h-4 bg-muted rounded"></div>
                                                            <div className="w-2/3 h-4 bg-muted rounded"></div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : filteredItemsByType.length === 0 ? (
                                            <div className="col-span-full text-center py-20 space-y-6">
                                                {type.value === 'knowledge_base' && <Icon name="Brain" className="size-20 text-muted-foreground mx-auto" />}
                                                {type.value === 'tool' && <Icon name="Wrench" className="size-20 text-muted-foreground mx-auto" />}
                                                {type.value === 'mcp' && <Icon name="Wifi" className="size-20 text-muted-foreground mx-auto" />}
                                                {type.value === 'prompt_set' && <Icon name="MessageSquare" className="size-20 text-muted-foreground mx-auto" />}
                                                <div className="space-y-3">
                                                    <h3 className="text-2xl font-semibold text-foreground leading-relaxed">
                                                        No {type.label.toLowerCase()} found
                                                    </h3>
                                                    <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                                                        Check back later for new {type.label.toLowerCase()} or try a different search.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            filteredItemsByType.map((item) => (
                                                <MarketplaceItemCard
                                                    key={item.id}
                                                    item={item}
                                                    onPurchase={handlePurchase}
                                                />
                                            ))
                                        )}
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}