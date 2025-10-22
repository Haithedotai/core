import { useState } from 'react';
import { Button } from '../../../lib/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../lib/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../lib/components/ui/avatar';
import { Badge } from '../../../lib/components/ui/badge';
import { Copy, CheckCircle, Users, Package } from 'lucide-react';
import { toast } from 'sonner';
import type { CreatorDetails } from 'services';
import { useHaitheApi } from '@/src/lib/hooks/use-haithe-api';
import { truncateText } from '@/src/lib/utils';
import MarkdownRenderer from '@/src/lib/components/custom/MarkdownRenderer';

interface CreatorCardProps {
  creator: CreatorDetails & { name?: string; description?: string; image?: string };
  onCreatorClick: (creator: CreatorDetails) => void;
}

export default function CreatorCard({ creator, onCreatorClick }: CreatorCardProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const { data: creatorProducts } = useHaitheApi().getCreatorProducts(creator.wallet_address);
  const productCount = creatorProducts?.length || 0;

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

  const handleCardClick = () => {
    onCreatorClick(creator);
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(creator.wallet_address);
  };

  return (
    <Card onClick={handleCardClick} className="relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-secondary/[0.02] rounded-lg" />
      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-background shadow-sm">
              <AvatarImage src={creator.image} alt={creator.name || 'Creator'} />
              <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                {creator.name?.split(' ').map((n: string) => n[0]).join('') ||
                 creator.wallet_address.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle
                title={creator.name || 'Unnamed Creator'}
                className="text-xl font-semibold truncate leading-tight"
              >
                {creator.name || 'Unnamed Creator'}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Creator since {new Date(creator.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Description */}
        {creator.description && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground line-clamp-3">
              <MarkdownRenderer
                content={truncateText(creator.description, 120)}
                className="text-muted-foreground prose-p:text-muted-foreground prose-strong:text-muted-foreground prose-em:text-muted-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:text-muted-foreground"
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-xs px-3 py-1">
            <Package className="size-3 mr-1" />
            {productCount} {productCount === 1 ? 'Product' : 'Products'}
          </Badge>
          <Badge variant="outline" className="text-xs px-3 py-1">
            <Users className="size-3 mr-1" />
            Creator
          </Badge>
        </div>

        {/* Wallet Address */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Wallet Address</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyClick}
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
                {creator.wallet_address.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate font-mono">
                {creator.wallet_address.slice(0, 6)}...{creator.wallet_address.slice(-4)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          size="sm"
          onClick={handleCardClick}
          className="w-full text-xs h-9"
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
}
