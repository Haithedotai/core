import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Heart, ExternalLink, Clock, Tag, Copy, CheckCircle, Wallet, Hash, User } from 'lucide-react';
import { Button } from '../../../lib/components/ui/button';
import { Badge } from '../../../lib/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../lib/components/ui/card';
import { Separator } from '../../../lib/components/ui/separator';
import { Skeleton } from '../../../lib/components/ui/skeleton';
import MarketplaceLayout from '../components/MarketplaceLayout';
import { useHaitheApi } from '@/src/lib/hooks/use-haithe-api';
import { toast } from 'sonner';

export default function ItemDetailPage() {
  const { id } = useParams({ from: '/marketplace/item/$id' });
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const haithe = useHaitheApi();
  const { data: item, isLoading: isLoadingItem } = haithe.getProductById(Number(id));

  const handleFavorite = (itemId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      const itemIdStr = itemId.toString();
      if (newFavorites.has(itemIdStr)) {
        newFavorites.delete(itemIdStr);
      } else {
        newFavorites.add(itemIdStr);
      }
      return newFavorites;
    });
  };

  const handlePurchase = (item: {
    price_per_call: number;
    name: string;
  }) => {
    // Mock purchase handler - replace with actual payment flow
    console.log('Purchasing item:', item);
    const priceInEth = item.price_per_call / 1e15; // Convert from wei to ETH
    alert(`Would purchase ${item.name} for ${priceInEth} ETH`);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'knowledge:text':
        return '📄';
      case 'knowledge:html':
        return '🌐';
      case 'knowledge:pdf':
        return '📕';
      case 'knowledge:csv':
        return '📊';
      case 'knowledge:url':
        return '🔗';
      case 'promptset':
        return '💬';
      case 'tool:rpc':
        return '⚙️';
      default:
        return '🤖';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'knowledge:text':
        return 'Text Knowledge';
      case 'knowledge:html':
        return 'HTML Knowledge';
      case 'knowledge:pdf':
        return 'PDF Knowledge';
      case 'knowledge:csv':
        return 'CSV Knowledge';
      case 'knowledge:url':
        return 'URL Knowledge';
      case 'promptset':
        return 'Prompt Set';
      case 'tool:rpc':
        return 'RPC Tool';
      default:
        return category;
    }
  };

  if (isLoadingItem) {
    return (
      <MarketplaceLayout>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Skeleton className="h-8 w-32" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-80 w-full" />
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </div>
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  if (!item) {
    return (
      <MarketplaceLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-2xl font-semibold mb-2">Product Not Found</h3>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => navigate({ to: '/marketplace' })}>
              Back to Marketplace
            </Button>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  const priceInEth = item.price_per_call / 1e15; // Convert from wei to ETH
  const isFavorited = favorites.has(item.id.toString());
  const categoryIcon = getCategoryIcon(item.category);
  const categoryLabel = getCategoryLabel(item.category);

  return (
    <MarketplaceLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back button */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/marketplace' })}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to Marketplace
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20 text-3xl">
                    {categoryIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-4xl font-bold text-foreground mb-2">{item.name}</h1>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {categoryLabel}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Hash className="size-4" />
                        #{item.id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Section */}
              <Card className="overflow-hidden">
                <div className="h-64 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-grid-white/10" />
                  <div className="relative text-center space-y-4">
                    <div className="text-8xl mb-4">{categoryIcon}</div>
                    <h2 className="text-2xl font-semibold">{item.name}</h2>
                    <p className="text-muted-foreground max-w-md">
                      A {categoryLabel.toLowerCase()} product available for purchase on the marketplace
                    </p>
                  </div>
                </div>
              </Card>

              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">About This Product</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <p>
                        This is a <strong>{categoryLabel}</strong> product created by{' '}
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {item.creator.slice(0, 6)}...{item.creator.slice(-4)}
                        </code>
                        . It's available for purchase and can be used in your AI applications.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Technical Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Hash className="size-4" />
                            Product ID
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <code className="text-sm font-mono">{item.id}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(item.id.toString(), 'Product ID')}
                            >
                              {copiedField === 'Product ID' ? (
                                <CheckCircle className="size-4 text-green-500" />
                              ) : (
                                <Copy className="size-4" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Tag className="size-4" />
                            Category
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge variant="outline">{item.category}</Badge>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Wallet className="size-4" />
                            Creator Address
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <code className="text-sm font-mono">{item.creator}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(item.creator, 'Creator Address')}
                            >
                              {copiedField === 'Creator Address' ? (
                                <CheckCircle className="size-4 text-green-500" />
                              ) : (
                                <Copy className="size-4" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <ExternalLink className="size-4" />
                            Product Address
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <code className="text-sm font-mono">{item.address}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(item.address, 'Product Address')}
                            >
                              {copiedField === 'Product Address' ? (
                                <CheckCircle className="size-4 text-green-500" />
                              ) : (
                                <Copy className="size-4" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-center">Purchase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {priceInEth.toFixed(6)} ETH
                    </div>
                    <p className="text-sm text-muted-foreground">per call</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ≈ ${(priceInEth * 3000).toFixed(2)} USD
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => handlePurchase(item)}
                    >
                      Purchase Now
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleFavorite(item.id)}
                    >
                      <Heart className={`size-4 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                      {isFavorited ? 'Favorited' : 'Add to Favorites'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Creator Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Creator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-12 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border">
                      <span className="text-sm font-mono font-semibold">
                        {item.creator.slice(2, 4).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate font-mono">
                        {item.creator.slice(0, 6)}...{item.creator.slice(-4)}
                      </p>
                      <p className="text-xs text-muted-foreground">Creator</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate({ to: `/profile/${item.creator}` })}
                    >
                      <User className="size-4 mr-2" />
                      Visit Creator
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => copyToClipboard(item.creator, 'Creator Address')}
                    >
                      {copiedField === 'Creator Address' ? (
                        <CheckCircle className="size-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="size-4 mr-2" />
                      )}
                      Copy Address
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Product Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm font-medium">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="text-sm font-medium">{priceInEth.toFixed(6)} ETH</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
} 