export type MarketplaceItemType = 'knowledgeBase' | 'lambda' | 'instructionSet' | 'promptSet';

export interface BaseMarketplaceItem {
  id: string;
  name: string;
  description: string;
  type: MarketplaceItemType;
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
  image?: string;
  tags: string[];
  category: string;
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

export interface LambdaFunction extends BaseMarketplaceItem {
  type: 'lambda';
  metadata: {
    runtime: string; // e.g., "Python 3.9", "Node.js 18"
    memory: string; // e.g., "512 MB"
    timeout: string; // e.g., "30s"
    triggers: string[];
    apiEndpoints: number;
    language: string;
  };
}

export interface InstructionSet extends BaseMarketplaceItem {
  type: 'instructionSet';
  metadata: {
    complexity: 'beginner' | 'intermediate' | 'advanced';
    useCase: string;
    steps: number;
    estimatedTime: string; // e.g., "5-10 minutes"
    prerequisites: string[];
    compatibility: string[];
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

export type MarketplaceItem = KnowledgeBase | LambdaFunction | InstructionSet | PromptSet;

export interface MarketplaceFilters {
  type?: MarketplaceItemType[];
  category?: string[];
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
    [key: string]: number;
  };
} 