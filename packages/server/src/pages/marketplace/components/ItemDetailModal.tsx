import { useState } from 'react';
import { X, Star, Download, Eye, Heart, CheckCircle, ExternalLink, Clock, Users, Tag } from 'lucide-react';
import { Button } from '../../../lib/components/ui/button';
import { Badge } from '../../../lib/components/ui/badge';
import { Card } from '../../../lib/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../lib/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../lib/components/ui/tabs';
import { Separator } from '../../../lib/components/ui/separator';
import type { MarketplaceItem } from '../types';

interface ItemDetailModalProps {
  item: MarketplaceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: (item: MarketplaceItem) => void;
  onFavorite?: (itemId: string) => void;
  isFavorited?: boolean;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'knowledgeBase': return '🧠';
    case 'lambda': return '⚡';
    case 'instructionSet': return '📋';
    case 'promptSet': return '💬';
    default: return '🤖';
  }
};

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

export default function ItemDetailModal({
  item,
  isOpen,
  onClose,
  onPurchase,
  onFavorite,
  isFavorited = false
}: ItemDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{getTypeIcon(item.type)}</span>
            <div>
              <h2 className="text-xl font-bold">{item.name}</h2>
              <p className="text-sm text-muted-foreground">{getTypeLabel(item.type)}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image */}
            <div className="relative mb-6">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              {item.featured && (
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                  ⭐ Featured
                </Badge>
              )}
              {item.verified && (
                <Badge variant="outline" className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm">
                  <CheckCircle className="size-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
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
                  <h3 className="font-semibold mb-3">Technical Specifications</h3>
                  <Card className="p-4">
                    {renderMetadata(item)}
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Created</h4>
                    <p>{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Last Updated</h4>
                    <p>{new Date(item.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Category</h4>
                    <p>{item.category}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Downloads</h4>
                    <p>{item.stats.downloads.toLocaleString()}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Reviews coming soon...</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="p-6">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold">{item.price.amount} {item.price.currency}</p>
              </div>

              <div className="space-y-3 mb-6">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => onPurchase?.(item)}
                >
                  Purchase Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onFavorite?.(item.id)}
                >
                  <Heart className={`size-4 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorited ? 'Favorited' : 'Add to Favorites'}
                </Button>
              </div>

              <Separator className="my-4" />

              {/* Stats */}
              <div className="space-y-3 text-sm">
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
              <h3 className="font-semibold mb-3">Creator</h3>
              <div className="flex items-center gap-3 mb-3">
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
              <Button variant="outline" className="w-full">
                <Users className="size-4 mr-2" />
                View Profile
              </Button>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 