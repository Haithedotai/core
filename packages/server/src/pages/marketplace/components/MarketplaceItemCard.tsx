import { Heart, Star, Download, Eye, CheckCircle } from 'lucide-react';
import { Button } from '../../../lib/components/ui/button';
import { Badge } from '../../../lib/components/ui/badge';
import { Card } from '../../../lib/components/ui/card';
import type { MarketplaceItem } from '../types';

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  onItemClick: (item: MarketplaceItem) => void;
  onFavorite?: (itemId: string) => void;
  isFavorited?: boolean;
}

const getTypeImage = (type: string) => {
  switch (type) {
    case 'knowledgeBase':
      return 'https://images.pexels.com/photos/7135037/pexels-photo-7135037.jpeg';
    case 'lambda':
      return 'https://images.pexels.com/photos/1906228/pexels-photo-1906228.jpeg';
    case 'instructionSet':
      return 'https://images.unsplash.com/photo-1637055159652-2b8837731f00?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    case 'promptSet':
      return 'https://images.pexels.com/photos/1906228/pexels-photo-1906228.jpeg';
    default:
      return 'https://images.pexels.com/photos/1906228/pexels-photo-1906228.jpeg';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'knowledgeBase':
      return 'Knowledge Base';
    case 'lambda':
      return 'Lambda Function';
    case 'instructionSet':
      return 'Instruction Set';
    case 'promptSet':
      return 'Prompt Set';
    default:
      return 'AI Asset';
  }
};

export default function MarketplaceItemCard({ 
  item, 
  onItemClick, 
  onFavorite, 
  isFavorited = false 
}: MarketplaceItemCardProps) {
  const typeImage = getTypeImage(item.type);
  const typeLabel = getTypeLabel(item.type);
  const mainImage = item.image || typeImage;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer bg-card border border-border @container">
      <div className="relative" onClick={() => onItemClick(item)}>
        <img 
          src={mainImage} 
          alt={item.name}
          className="w-full h-40 @md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button variant="secondary" size="sm">
            View Details
          </Button>
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs flex items-center gap-1">
            <img src={typeImage} alt={typeLabel} className="inline-block w-5 h-5 rounded-full object-cover mr-1" />
            <span className="hidden @md:inline">{typeLabel}</span>
          </Badge>
        </div>

        {/* Featured Badge */}
        {item.featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary text-primary-foreground text-xs">
              <span className="@md:hidden">⭐</span>
              <span className="hidden @md:inline">⭐ Featured</span>
            </Badge>
          </div>
        )}

        {/* Verified Badge */}
        {item.verified && (
          <div className="absolute top-12 right-3">
            <Badge variant="outline" className="bg-background/90 backdrop-blur-sm text-xs">
              <CheckCircle className="size-3 @md:mr-1" />
              <span className="hidden @md:inline">Verified</span>
            </Badge>
          </div>
        )}
      </div>

      <div className="p-3 @md:p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors text-sm @md:text-base">
            {item.name}
          </h3>
          <p className="text-xs @md:text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>
          
          {/* Tags - responsive display */}
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                +{item.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center gap-2 mb-3">
          <img 
            src={item.creator.avatar} 
            alt={item.creator.name}
            className="size-5 @md:size-6 rounded-full"
          />
          <span className="text-xs @md:text-sm font-medium truncate">{item.creator.name}</span>
          {item.creator.verified && (
            <CheckCircle className="size-3 @md:size-4 text-primary flex-shrink-0" />
          )}
        </div>

        {/* Stats - responsive layout */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-3 @md:gap-4">
            <div className="flex items-center gap-1">
              <Star className="size-3 fill-yellow-400 text-yellow-400" />
              <span>{item.rating.average}</span>
              <span className="hidden @md:inline">({item.rating.count})</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="size-3" />
              <span className="@md:hidden">{(item.stats.downloads / 1000).toFixed(0)}k</span>
              <span className="hidden @md:inline">{item.stats.downloads.toLocaleString()}</span>
            </div>
            <div className="hidden @sm:flex items-center gap-1">
              <Eye className="size-3" />
              <span className="@md:hidden">{(item.stats.views / 1000).toFixed(0)}k</span>
              <span className="hidden @md:inline">{item.stats.views.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="text-base @md:text-lg font-bold">
              {item.price.amount} {item.price.currency}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFavorite?.(item.id);
              }}
              className="p-2"
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
              className="text-xs @md:text-sm"
            >
              View
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
} 