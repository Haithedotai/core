import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Star, Download, Eye, Heart, CheckCircle, ExternalLink, Clock, Users, Tag } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '../../../lib/components/ui/button';
import { Badge } from '../../../lib/components/ui/badge';
import { Card } from '../../../lib/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../lib/components/ui/tabs';
import { Separator } from '../../../lib/components/ui/separator';
import type { MarketplaceItem } from '../types';
import { mockMarketplaceData } from '../mockData';
import { getTypeImage } from '../components/MarketplaceItemCard';
import MarketplaceLayout from '../components/MarketplaceLayout';
import { useHaitheApi } from '@/src/lib/hooks/use-haithe-api';

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'knowledgeBase': return 'Knowledge Base';
    case 'lambda': return 'Lambda Function';
    case 'instructionSet': return 'Instruction Set';
    case 'promptSet': return 'Prompt Set';
    default: return 'AI Asset';
  }
};

const renderMetadata = (item: MarketplaceItem) => {
  switch (item.type) {
    case 'knowledgeBase':
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Size</h4>
            <p className="font-semibold">{item.metadata.size}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Documents</h4>
            <p className="font-semibold">{item.metadata.documents.toLocaleString()}</p>
          </div>
          <div className="col-span-2">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Sources</h4>
            <div className="flex flex-wrap gap-1">
              {item.metadata.sources.map((source) => (
                <Badge key={source} variant="outline" className="text-xs">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Domains</h4>
            <div className="flex flex-wrap gap-1">
              {item.metadata.domains.map((domain) => (
                <Badge key={domain} variant="secondary" className="text-xs">
                  {domain}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      );

    case 'lambda':
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Runtime</h4>
            <p className="font-semibold">{item.metadata.runtime}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Memory</h4>
            <p className="font-semibold">{item.metadata.memory}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Timeout</h4>
            <p className="font-semibold">{item.metadata.timeout}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">API Endpoints</h4>
            <p className="font-semibold">{item.metadata.apiEndpoints}</p>
          </div>
          <div className="col-span-2">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Triggers</h4>
            <div className="flex flex-wrap gap-1">
              {item.metadata.triggers.map((trigger) => (
                <Badge key={trigger} variant="outline" className="text-xs">
                  {trigger}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      );

    case 'instructionSet':
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Complexity</h4>
            <Badge variant={
              item.metadata.complexity === 'beginner' ? 'secondary' :
                item.metadata.complexity === 'intermediate' ? 'outline' : 'destructive'
            }>
              {item.metadata.complexity}
            </Badge>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Steps</h4>
            <p className="font-semibold">{item.metadata.steps}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Estimated Time</h4>
            <p className="font-semibold">{item.metadata.estimatedTime}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Use Case</h4>
            <p className="font-semibold text-xs">{item.metadata.useCase}</p>
          </div>
          <div className="col-span-2">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Prerequisites</h4>
            <div className="flex flex-wrap gap-1">
              {item.metadata.prerequisites.map((prereq) => (
                <Badge key={prereq} variant="outline" className="text-xs">
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      );

    case 'promptSet':
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Prompts</h4>
            <p className="font-semibold">{item.metadata.prompts}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Difficulty</h4>
            <Badge variant={
              item.metadata.difficulty === 'beginner' ? 'secondary' :
                item.metadata.difficulty === 'intermediate' ? 'outline' : 'destructive'
            }>
              {item.metadata.difficulty}
            </Badge>
          </div>
          <div className="col-span-2">
            <h4 className="font-medium text-sm text-muted-foreground">Response Type</h4>
            <p className="font-semibold">{item.metadata.responseType}</p>
          </div>
          <div className="col-span-2">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Compatible Models</h4>
            <div className="flex flex-wrap gap-1">
              {item.metadata.models.map((model) => (
                <Badge key={model} variant="secondary" className="text-xs">
                  {model}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default function ItemDetailPage() {
  const { id } = useParams({ from: '/marketplace/item/$id' });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const haithe = useHaitheApi();
  const { data: itemData, isLoading: isLoadingItem } = haithe.getProductById(Number(id));

  useEffect(() => {
    // Find the item by ID from mock data
    const foundItem = mockMarketplaceData.find(item => item.id === id);
    if (foundItem) {
      setItem(foundItem);
    } else {
      // Handle item not found - could redirect to 404 or marketplace
      navigate({ to: '/marketplace' });
    }
  }, [id, navigate]);

  const handleFavorite = (itemId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      return newFavorites;
    });
  };

  const handlePurchase = (item: MarketplaceItem) => {
    // Mock purchase handler - replace with actual payment flow
    console.log('Purchasing item:', item);
    alert(`Would purchase ${item.name} for ${item.price.amount} ${item.price.currency}`);
  };

  const handleSearch = (query: string) => {
    // Navigate back to marketplace with search query
    navigate({
      to: '/marketplace',
      search: { q: query }
    });
  };

  if (!item) {
    return (
      <MarketplaceLayout>
        <div className="h-full flex flex-col @container">
          <div className="flex-1 overflow-y-auto pt-6 pb-12">
            <div className="mx-auto px-8 w-full @container">
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                  <div className="text-4xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold mb-2">Item not found</h3>
                  <p className="text-muted-foreground mb-6">The item you're looking for doesn't exist.</p>
                  <Button onClick={() => navigate({ to: '/marketplace' })}>
                    Back to Marketplace
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MarketplaceLayout>
    );
  }

  return (
    <MarketplaceLayout>
      <div className="h-full flex flex-col @container">
        {/* Main content area with responsive padding */}
        <div className="flex-1 overflow-y-auto pt-6 pb-12">
          <div className="mx-auto px-8 w-full @container">
            {/* Back button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/marketplace' })}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="size-4" />
                Back to Marketplace
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={getTypeImage(item.type)} alt={item.name} className="size-12 rounded-full" />
                    <div>
                      <h1 className="text-3xl font-bold">{item.name}</h1>
                      <p className="text-lg text-muted-foreground">{getTypeLabel(item.type)}</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    {item.featured && (
                      <Badge className="bg-primary text-primary-foreground">
                        ⭐ Featured
                      </Badge>
                    )}
                    {item.verified && (
                      <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                        <CheckCircle className="size-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Image */}
                <div className="relative mb-8">
                  <img
                    src={item.image || getTypeImage(item.type)}
                    alt={item.name}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Description</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            <Tag className="size-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
                      <Card className="p-6">
                        {renderMetadata(item)}
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
                        <p className="font-semibold">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Last Updated</h4>
                        <p className="font-semibold">{new Date(item.updated_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Category</h4>
                        <p className="font-semibold">{item.category}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground">Downloads</h4>
                        <p className="font-semibold">{item.stats.downloads.toLocaleString()}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4">
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Reviews coming soon...</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="space-y-6 ">
                {/* Purchase Card */}
                <Card className="p-6 sticky top-32">
                  <div className="text-center mb-6">
                    <p className="text-4xl font-bold">{item.price.amount} {item.price.currency}</p>
                  </div>

                  <div className="space-y-3 mb-6">
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
                      <Heart className={`size-4 mr-2 ${favorites.has(item.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      {favorites.has(item.id) ? 'Favorited' : 'Add to Favorites'}
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  {/* Stats */}
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        <span>Rating</span>
                      </div>
                      <span className="font-medium">
                        {item.rating.average} ({item.rating.count} reviews)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Download className="size-4" />
                        <span>Downloads</span>
                      </div>
                      <span className="font-medium">{item.stats.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="size-4" />
                        <span>Views</span>
                      </div>
                      <span className="font-medium">{item.stats.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="size-4" />
                        <span>Favorites</span>
                      </div>
                      <span className="font-medium">{item.stats.favorites.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>

                {/* Creator Card */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Creator</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={item.creator.avatar}
                      alt={item.creator.name}
                      className="size-12 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.creator.name}</p>
                        {item.creator.verified && (
                          <CheckCircle className="size-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/marketplace/profile/$id" params={{ id: item.creator.id }}>
                      <Users className="size-4 mr-2" />
                      View Profile
                      </Link>
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketplaceLayout>
  );
} 