import { Heart, Star, Download, Eye, CheckCircle, FileText, Code, Database, Link, Plus } from 'lucide-react';
import { Button } from '../../../lib/components/ui/button';
import { Badge } from '../../../lib/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../lib/components/ui/card';
import { Separator } from '../../../lib/components/ui/separator';
import type { MarketplaceItem } from '../types';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  onItemClick: (item: MarketplaceItem) => void;
  onFavorite?: (itemId: string) => void;
  isFavorited?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'knowledge:text':
      return FileText;
    case 'knowledge:html':
      return Code;
    case 'knowledge:pdf':
      return FileText;
    case 'knowledge:csv':
      return Database;
    case 'knowledge:url':
      return Link;
    case 'promptset':
      return Code;
    case 'tool:rpc':
      return Code;
    default:
      return FileText;
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

export default function MarketplaceItemCard({ 
  item, 
  onItemClick, 
  onFavorite, 
  isFavorited = false 
}: MarketplaceItemCardProps) {
  const Icon = getCategoryIcon(item.category);
  const categoryLabel = getCategoryLabel(item.category);

  return (
    <Card className="relative overflow-hidden shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group cursor-pointer @container border">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] to-secondary/[0.02]" />
      
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3 @md:gap-4">
            <div className="size-10 @md:size-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20">
              <Icon className="size-5 @md:size-6 text-primary" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-base @md:text-lg font-semibold truncate">{item.name}</span>
              {item.featured && (
                <Badge className="bg-primary text-primary-foreground text-xs w-fit mt-1">
                  ⭐ Featured
                </Badge>
              )}
            </div>
          </div>
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed mt-3 line-clamp-2 @md:line-clamp-3">
          {item.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative space-y-4 @md:space-y-6">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs @md:text-sm px-2 @md:px-3 py-1">
            {categoryLabel}
          </Badge>
          <span className="text-base @md:text-lg font-bold text-primary">
            {item.price.amount} {item.price.currency}
          </span>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3 @md:gap-4">
          <div className="space-y-2 @md:space-y-3">
            <div className="flex items-center justify-between text-xs @md:text-sm">
              <span className="text-muted-foreground">Downloads:</span>
              <span className="font-medium">{item.stats.downloads.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs @md:text-sm">
              <span className="text-muted-foreground">Views:</span>
              <span className="font-medium">{item.stats.views.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-2 @md:space-y-3">
            <div className="flex items-center justify-between text-xs @md:text-sm">
              <span className="text-muted-foreground">Rating:</span>
              <div className="flex items-center gap-1">
                <Star className="size-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{item.rating.average}</span>
                <span className="text-muted-foreground hidden @sm:inline">({item.rating.count})</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs @md:text-sm">
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2 @md:space-y-3">
          <p className="text-xs @md:text-sm font-medium">Tags:</p>
          <div className="flex flex-wrap gap-1 @md:gap-2">
            {item.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-1">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                +{item.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>

        <Separator />
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 @md:gap-3 min-w-0 flex-1">
            <img 
              src={item.creator.avatar} 
              alt={item.creator.name}
              className="size-6 @md:size-8 rounded-full border-2 border-border flex-shrink-0"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs @md:text-sm font-medium truncate">{item.creator.name}</span>
              {item.creator.verified && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="size-3 text-primary" />
                  <span className="text-xs text-muted-foreground hidden @sm:inline">Verified</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 @md:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.(item.id);
              }}
              className="p-1 @md:p-2 hover:bg-primary/10"
            >
              <Heart 
                className={`size-4 transition-colors ${
                  isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'
                }`} 
              />
            </Button>
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onItemClick(item);
              }}
              className="px-2 @md:px-4 py-1 @md:py-2 text-xs @md:text-sm"
            >
              <span className="hidden @sm:inline">View Details</span>
              <span className="@sm:hidden">View</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 