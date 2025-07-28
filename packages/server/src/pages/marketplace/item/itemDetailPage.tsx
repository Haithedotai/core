import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { Button } from '../../../lib/components/ui/button';
import { Badge } from '../../../lib/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../lib/components/ui/card';
import { Skeleton } from '../../../lib/components/ui/skeleton';
import MarketplaceLayout from '../components/MarketplaceLayout';
import { useHaitheApi } from '@/src/lib/hooks/use-haithe-api';
import { toast } from 'sonner';
import { useStore } from '@/src/lib/hooks/use-store';

export default function ItemDetailPage() {
  const { id } = useParams({ from: '/marketplace/item/$id' });
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const haithe = useHaitheApi();
  const { data: item, isLoading: isLoadingItem } = haithe.getProductById(Number(id));
  const { selectedOrganizationId } = useStore();
  const { data: organization } = haithe.getOrganization(selectedOrganizationId);
  const enableProduct = haithe.enableProduct;

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

  const priceInEth = item.price_per_call / 1e18; // Convert from wei to USD 18 decimals
  const categoryIcon = getCategoryIcon(item.category);
  const categoryLabel = getCategoryLabel(item.category);

  return (
    <MarketplaceLayout>
      <div className="min-h-full bg-background">
        <div className="mx-auto p-8">
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

          <div className="grid grid-cols-1 w-full @5xl:grid-cols-2 gap-8">
            {/* Main Content */}
            <div className="space-y-8">
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
                <CardContent className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Description</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <p>
                        This is a <span className='font-bold text-primary'>{categoryLabel}</span> product created by{' '}
                        <code className="text-xs bg-muted-foreground px-1 py-0.5 rounded">
                          {item.creator.slice(0, 6)}...{item.creator.slice(-4)}
                        </code>
                        . It's available for purchase and can be used in your AI applications.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mt-4">
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
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card className="lg:mt-28">
                <CardHeader>
                  <CardTitle className="text-center">Purchase Tool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {priceInEth.toFixed(6)} USD <span className="text-sm text-muted-foreground">per call</span>
                    </div>

                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={async () => {
                        try {
                          if (!organization) {
                            toast.error('No organization selected');
                            return;
                          }
  
                          await enableProduct.mutateAsync({
                            product_address: item.address,
                            org_address: organization.address
                          })
                        } catch (error) {
                          toast.error('Failed to add product to organization');
                          console.error(error);
                        }
                      }}
                    >
                      {enableProduct.isPending ? 'Adding...' : 'Add to current organization'}
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
                  <div className="flex items-center gap-2 mb-4">
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

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate({ to: `/marketplace/profile/${item.creator}` })}
                    >
                      <ExternalLink className="size-4" />
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
                      <span className="text-sm text-muted-foreground">Product ID</span>
                      <span className="text-sm font-medium">{item.id}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Created at</span>
                      <span className="text-sm font-medium">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <span className="text-sm font-medium">{categoryLabel}</span>
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