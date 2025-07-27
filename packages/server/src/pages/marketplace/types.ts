export type MarketplaceItemType = 'knowledgeBase' | 'promptSet' | 'tool';

export type MarketplaceCategory = 'knowledge:text' | 'knowledge:html' | 'knowledge:pdf' | 'knowledge:csv' | 'knowledge:url' | 'promptset' | 'tool:rpc';

export interface BaseMarketplaceItem {
  id: string;
  name: string;
  description: string;
  type: MarketplaceItemType;
  category: MarketplaceCategory;
  creator: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };
  price: {
    amount: number;
    currency: 'ETH' | 'USD';
  };
  tags: string[];
  rating: {
    average: number;
    count: number;
  };
  stats: {
    downloads: number;
    favorites: number;
    views: number;
  };
  created_at: string;
  updated_at: string;
  featured: boolean;
  verified: boolean;
}

export interface KnowledgeBase extends BaseMarketplaceItem {
  type: 'knowledgeBase';
  metadata: {
    size: string; // e.g., "2.5 GB"
    documents: number;
    sources: string[];
    domains: string[];
    lastUpdated: string;
  };
}

export interface PromptSet extends BaseMarketplaceItem {
  type: 'promptSet';
  metadata: {
    prompts: number;
    models: string[]; // e.g., ["GPT-4", "Claude-3"]
    themes: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    responseType: string; // e.g., "Text", "Code", "Analysis"
    languages: string[];
  };
}

export interface Tool extends BaseMarketplaceItem {
  type: 'tool';
  metadata: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoints: number;
    responseFormat: string;
    rateLimit?: string;
    supportedServices?: string[];
    supportedExchanges?: string[];
    dataTypes?: string[];
    updateFrequency?: string;
  };
}

export type MarketplaceItem = KnowledgeBase | PromptSet | Tool;

export interface MarketplaceFilters {
  type?: MarketplaceItemType[];
  category?: MarketplaceCategory[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  tags?: string[];
  verified?: boolean;
  featured?: boolean;
  sortBy?: 'recent' | 'popular' | 'price_low' | 'price_high' | 'rating';
}

export interface MarketplaceStats {
  totalItems: number;
  totalCreators: number;
  totalSales: number;
  categories: {
    [key in MarketplaceCategory]?: number;
  };
} 