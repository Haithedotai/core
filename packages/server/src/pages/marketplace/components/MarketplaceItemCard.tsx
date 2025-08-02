import { FileText, Code, Database, Link, MessageSquare, Copy, CheckCircle } from 'lucide-react';
import { Button } from '../../../lib/components/ui/button';
import { Badge } from '../../../lib/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../lib/components/ui/card';
import { Separator } from '../../../lib/components/ui/separator';
import type { Product } from 'services';
import { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from '@/src/lib/hooks/use-store';
import { useHaitheApi } from '@/src/lib/hooks/use-haithe-api';

interface MarketplaceItemCardProps {
  item: Product;
  onItemClick: (item: Product) => void;
  onFavorite?: (itemId: number) => void;
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
      return MessageSquare;
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

const getCategoryEmoji = (category: string) => {
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

export default function MarketplaceItemCard({ 
  item, 
  onItemClick, 
  onFavorite, 
  isFavorited = false 
}: MarketplaceItemCardProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const Icon = getCategoryIcon(item.category);
  const categoryLabel = getCategoryLabel(item.category);
  const categoryEmoji = getCategoryEmoji(item.category);
  const priceInEth = item.price_per_call / 1e18; // Convert from wei to USDT 18 decimals

  const haithe = useHaitheApi();
  const { selectedOrganizationId } = useStore();
  const { data: organization } = haithe.getOrganization(selectedOrganizationId);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card onClick={() => onItemClick(item)} className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20 text-2xl">
              {categoryEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate leading-tight">{item.name}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {categoryLabel} • #{item.id}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {/* Price and Category */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs px-3 py-1">
            <Icon className="size-3 mr-1" />
            {categoryLabel}
          </Badge>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">
              {priceInEth} USDT
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Product Info Grid */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Price per call:</span>
              <span className="font-medium">{priceInEth} USDT</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{categoryLabel}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Product ID:</span>
              <span className="font-medium font-mono">{item.id}</span>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Creator Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Creator</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(item.creator);
              }}
              className="h-6 px-2 text-xs"
            >
              {copiedAddress ? (
                <CheckCircle className="size-3 text-green-500" />
              ) : (
                <Copy className="size-3" />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border">
              <span className="text-xs font-mono font-semibold">
                {item.creator.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate font-mono">
                {item.creator.slice(0, 6)}...{item.creator.slice(-4)}
              </p>
              <p className="text-xs text-muted-foreground">Wallet Address</p>
            </div>
          </div>
        </div>

        <Separator />
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onItemClick(item);
            }}
            className="flex-1 text-xs h-8"
          >
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(item.address);
            }}
            className="h-8 w-8 p-0"
            title="Copy product address"
          >
            {copiedAddress ? (
              <CheckCircle className="size-3 text-green-500" />
            ) : (
              <Copy className="size-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 