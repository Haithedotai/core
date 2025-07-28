import type { MarketplaceItem, MarketplaceStats } from './types';

export const mockMarketplaceData: MarketplaceItem[] = [
  // Knowledge Bases
  {
    id: 'kb-001',
    name: 'Financial Market Analysis Database',
    description: 'Comprehensive database containing 10+ years of financial market data, news articles, and expert analysis covering global markets, cryptocurrencies, and economic indicators.',
    type: 'knowledgeBase',
    category: 'knowledge:text',
    creator: {
      id: '1',
      name: 'FinanceAI Labs',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    },
    price: {
      amount: 2.5,
      currency: 'USDT',
    },
    tags: ['finance', 'markets', 'analysis', 'trading'],
    rating: {
      average: 4.8,
      count: 342,
    },
    stats: {
      downloads: 1250,
      favorites: 890,
      views: 15600,
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-12-01T14:22:00Z',
    metadata: {
      size: '12.3 GB',
      documents: 45680,
      sources: ['Bloomberg', 'Reuters', 'Financial Times', 'SEC Filings'],
      domains: ['finance', 'economics', 'cryptocurrency', 'markets'],
      lastUpdated: '2024-12-01T14:22:00Z',
    },
  },
  {
    id: 'kb-002',
    name: 'Medical Research Archive',
    description: 'Curated collection of peer-reviewed medical research papers, clinical trial data, and pharmaceutical information from leading medical journals.',
    type: 'knowledgeBase',
    category: 'knowledge:pdf',
    creator: {
      id: '2',
      name: 'MedTech Solutions',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
    },
    price: {
      amount: 1.8,
      currency: 'USDT',
    },
    tags: ['medical', 'research', 'healthcare', 'clinical'],
    rating: {
      average: 4.9,
      count: 156,
    },
    stats: {
      downloads: 678,
      favorites: 445,
      views: 8900,
    },
    created_at: '2024-02-10T09:15:00Z',
    updated_at: '2024-11-28T11:45:00Z',
    metadata: {
      size: '8.7 GB',
      documents: 23450,
      sources: ['PubMed', 'Nature', 'The Lancet', 'NEJM'],
      domains: ['medicine', 'healthcare', 'pharmaceuticals', 'biotech'],
      lastUpdated: '2024-11-28T11:45:00Z',
    },
  },

  // HTML Knowledge
  {
    id: 'html-001',
    name: 'Web Development Documentation',
    description: 'Comprehensive HTML documentation covering modern web development practices, frameworks, and best practices.',
    type: 'knowledgeBase',
    category: 'knowledge:html',
    creator: {
      id: '3',
      name: 'CodeWave Studios',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    },
    price: {
      amount: 0.75,
      currency: 'USDT',
    },
    tags: ['html', 'web-development', 'documentation', 'frontend'],
    rating: {
      average: 4.7,
      count: 203,
    },
    stats: {
      downloads: 945,
      favorites: 678,
      views: 12300,
    },
    created_at: '2024-03-05T16:20:00Z',
    updated_at: '2024-11-30T09:10:00Z',
    metadata: {
      size: '2.1 GB',
      documents: 1250,
      sources: ['MDN', 'W3C', 'Stack Overflow', 'GitHub'],
      domains: ['web-development', 'html', 'css', 'javascript'],
      lastUpdated: '2024-11-30T09:10:00Z',
    },
  },

  // CSV Knowledge
  {
    id: 'csv-001',
    name: 'Customer Behavior Dataset',
    description: 'Large-scale customer behavior dataset with purchase history, demographics, and interaction patterns for e-commerce analysis.',
    type: 'knowledgeBase',
    category: 'knowledge:csv',
    creator: {
      id: '4',
      name: 'DataInsights Corp',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    },
    price: {
      amount: 1.2,
      currency: 'USDT',
    },
    tags: ['data-analysis', 'customer-behavior', 'ecommerce', 'analytics'],
    rating: {
      average: 4.6,
      count: 89,
    },
    stats: {
      downloads: 567,
      favorites: 234,
      views: 7800,
    },
    created_at: '2024-04-12T11:30:00Z',
    updated_at: '2024-11-25T15:45:00Z',
    metadata: {
      size: '5.8 GB',
      documents: 2500000,
      sources: ['E-commerce platforms', 'Analytics tools', 'CRM systems'],
      domains: ['customer-analytics', 'ecommerce', 'marketing'],
      lastUpdated: '2024-11-25T15:45:00Z',
    },
  },

  // URL Knowledge
  {
    id: 'url-001',
    name: 'Tech News Aggregator',
    description: 'Curated collection of technology news sources, blogs, and industry publications for real-time tech insights.',
    type: 'knowledgeBase',
    category: 'knowledge:url',
    creator: {
      id: '5',
      name: 'TechPulse Media',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    },
    price: {
      amount: 0.45,
      currency: 'USDT',
    },
    tags: ['tech-news', 'aggregator', 'real-time', 'industry'],
    rating: {
      average: 4.5,
      count: 167,
    },
    stats: {
      downloads: 823,
      favorites: 612,
      views: 11400,
    },
    created_at: '2024-05-08T14:15:00Z',
    updated_at: '2024-11-29T13:20:00Z',
    metadata: {
      size: '1.2 GB',
      documents: 150,
      sources: ['TechCrunch', 'Wired', 'Ars Technica', 'The Verge'],
      domains: ['technology', 'innovation', 'business'],
      lastUpdated: '2024-11-29T13:20:00Z',
    },
  },

  // Prompt Sets
  {
    id: 'prompt-001',
    name: 'Creative Writing Mastery Prompts',
    description: 'Collection of 150+ carefully crafted prompts for creative writing, storytelling, character development, and narrative structure across multiple genres.',
    type: 'promptSet',
    category: 'promptset',
    creator: {
      id: '7',
      name: 'Literary AI Collective',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    },
    price: {
      amount: 0.35,
      currency: 'USDT',
    },
    tags: ['creative-writing', 'storytelling', 'literature', 'fiction'],
    rating: {
      average: 4.8,
      count: 278,
    },
    stats: {
      downloads: 1340,
      favorites: 897,
      views: 18900,
    },
    created_at: '2024-07-22T12:00:00Z',
    updated_at: '2024-11-26T10:15:00Z',
    metadata: {
      prompts: 157,
      models: ['GPT-4', 'Claude-3', 'Gemini Pro'],
      themes: ['Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Literary Fiction'],
      difficulty: 'intermediate',
      responseType: 'Creative Text',
      languages: ['English', 'Spanish', 'French'],
    },
  },
  {
    id: 'prompt-002',
    name: 'Code Review & Analysis Prompts',
    description: 'Professional-grade prompts for automated code review, security analysis, performance optimization suggestions, and best practice recommendations.',
    type: 'promptSet',
    category: 'promptset',
    creator: {
      id: '8',
      name: 'DevOps Automation',
      avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face',
    },
    price: {
      amount: 0.85,
      currency: 'USDT',
    },
    tags: ['code-review', 'security', 'optimization', 'development'],
    rating: {
      average: 4.6,
      count: 145,
    },
    stats: {
      downloads: 678,
      favorites: 423,
      views: 9800,
    },
    created_at: '2024-08-10T15:30:00Z',
    updated_at: '2024-11-24T08:45:00Z',
    metadata: {
      prompts: 89,
      models: ['GPT-4', 'Claude-3', 'CodeLlama'],
      themes: ['Security Analysis', 'Performance', 'Best Practices', 'Refactoring'],
      difficulty: 'advanced',
      responseType: 'Code Analysis',
      languages: ['Python', 'JavaScript', 'TypeScript', 'Go', 'Rust'],
    },
  },

  // RPC Tools
  {
    id: 'rpc-001',
    name: 'Weather API Integration Tool',
    description: 'RPC tool for fetching real-time weather data from multiple weather services with location-based forecasting.',
    type: 'tool',
    category: 'tool:rpc',
    creator: {
      id: '9',
      name: 'WeatherTech Solutions',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    },
    price: {
      amount: 0.25,
      currency: 'USDT',
    },
    tags: ['weather', 'api', 'forecasting', 'location'],
    rating: {
      average: 4.7,
      count: 94,
    },
    stats: {
      downloads: 456,
      favorites: 378,
      views: 6700,
    },
    created_at: '2024-06-15T10:45:00Z',
    updated_at: '2024-11-27T16:30:00Z',
    metadata: {
      method: 'GET',
      endpoints: 3,
      supportedServices: ['OpenWeatherMap', 'WeatherAPI', 'AccuWeather'],
      responseFormat: 'JSON',
      rateLimit: '1000 requests/hour',
    },
  },
  {
    id: 'rpc-002',
    name: 'Stock Market Data Tool',
    description: 'RPC tool for real-time stock market data, historical prices, and financial indicators from major exchanges.',
    type: 'tool',
    category: 'tool:rpc',
    creator: {
      id: '10',
      name: 'FinanceData Pro',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    },
    price: {
      amount: 0.65,
      currency: 'USDT',
    },
    tags: ['stocks', 'finance', 'real-time', 'trading'],
    rating: {
      average: 4.9,
      count: 156,
    },
    stats: {
      downloads: 789,
      favorites: 567,
      views: 8900,
    },
    created_at: '2024-07-20T14:30:00Z',
    updated_at: '2024-11-28T12:15:00Z',
    metadata: {
      method: 'GET',
      endpoints: 5,
      responseFormat: 'JSON',
      supportedExchanges: ['NYSE', 'NASDAQ', 'LSE', 'TSE'],
      dataTypes: ['Real-time', 'Historical', 'Indicators', 'News'],
      updateFrequency: 'Real-time',
    },
  },
];

export const mockStats: MarketplaceStats = {
  totalItems: 1847,
  totalCreators: 342,
  totalSales: 15680,
  categories: {
    'knowledge:text': 234,
    'knowledge:html': 189,
    'knowledge:pdf': 167,
    'knowledge:csv': 145,
    'knowledge:url': 123,
    'promptset': 298,
    'tool:rpc': 201,
  },
};


export const categories = [
  'All Categories',
  'Text Knowledge',
  'HTML Knowledge',
  'PDF Knowledge',
  'CSV Knowledge',
  'URL Knowledge',
  'Prompt Sets',
  'RPC Tools',
];

export const popularTags = [
  'nlp', 'machine-learning', 'api', 'automation', 'finance', 
  'healthcare', 'computer-vision', 'creative-writing', 'security',
  'data-analysis', 'real-time', 'optimization', 'ai-agents'
]; 