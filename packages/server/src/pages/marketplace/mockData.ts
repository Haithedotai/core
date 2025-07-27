import type { MarketplaceItem, MarketplaceStats } from './types';

export const mockMarketplaceData: MarketplaceItem[] = [
  // Knowledge Bases
  {
    id: 'kb-001',
    name: 'Financial Market Analysis Database',
    description: 'Comprehensive database containing 10+ years of financial market data, news articles, and expert analysis covering global markets, cryptocurrencies, and economic indicators.',
    type: 'knowledgeBase',
    creator: {
      id: '1',
      name: 'FinanceAI Labs',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
      verified: true,
    },
    price: {
      amount: 2.5,
      currency: 'ETH',
    },
    tags: ['finance', 'markets', 'analysis', 'trading'],
    category: 'Finance & Trading',
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
    featured: true,
    verified: true,
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
    creator: {
      id: '2',
      name: 'MedTech Solutions',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
      verified: true,
    },
    price: {
      amount: 1.8,
      currency: 'ETH',
    },
    tags: ['medical', 'research', 'healthcare', 'clinical'],
    category: 'Healthcare & Medicine',
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
    featured: false,
    verified: true,
    metadata: {
      size: '8.7 GB',
      documents: 23450,
      sources: ['PubMed', 'Nature', 'The Lancet', 'NEJM'],
      domains: ['medicine', 'healthcare', 'pharmaceuticals', 'biotech'],
      lastUpdated: '2024-11-28T11:45:00Z',
    },
  },

  // Lambda Functions
  {
    id: 'lambda-001',
    name: 'Real-time Sentiment Analyzer',
    description: 'High-performance Lambda function that analyzes sentiment from social media feeds, news articles, and customer reviews in real-time using advanced NLP models.',
    type: 'lambda',
    creator: {
      id: '3',
      name: 'CodeWave Studios',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      verified: true,
    },
    price: {
      amount: 0.75,
      currency: 'ETH',
    },
    tags: ['nlp', 'sentiment', 'realtime', 'api'],
    category: 'Natural Language Processing',
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
    featured: true,
    verified: true,
    metadata: {
      runtime: 'Python 3.11',
      memory: '1 GB',
      timeout: '30s',
      triggers: ['HTTP API', 'SQS', 'EventBridge'],
      apiEndpoints: 3,
      language: 'Python',
    },
  },
  {
    id: 'lambda-002',
    name: 'Image Classification Pipeline',
    description: 'Scalable image classification function supporting 1000+ object categories with 95%+ accuracy. Perfect for e-commerce, content moderation, and inventory management.',
    type: 'lambda',
    creator: {
      id: '4',
      name: 'VisionAI Corp',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      verified: false,
    },
    price: {
      amount: 1.2,
      currency: 'ETH',
    },
    tags: ['computer-vision', 'classification', 'ml', 'images'],
    category: 'Computer Vision',
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
    featured: false,
    verified: false,
    metadata: {
      runtime: 'Python 3.10',
      memory: '2 GB',
      timeout: '60s',
      triggers: ['HTTP API', 'S3'],
      apiEndpoints: 2,
      language: 'Python',
    },
  },

  // Instruction Sets
  {
    id: 'inst-001',
    name: 'Advanced RAG Implementation Guide',
    description: 'Step-by-step instructions for implementing Retrieval-Augmented Generation (RAG) systems with vector databases, embedding models, and optimization techniques.',
    type: 'instructionSet',
    creator: {
      id: '5',
      name: 'AI Architecture Guild',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
      verified: true,
    },
    price: {
      amount: 0.95,
      currency: 'ETH',
    },
    tags: ['rag', 'vector-db', 'embeddings', 'llm'],
    category: 'AI Architecture',
    rating: {
      average: 4.9,
      count: 167,
    },
    stats: {
      downloads: 823,
      favorites: 612,
      views: 11400,
    },
    created_at: '2024-05-08T14:15:00Z',
    updated_at: '2024-11-29T13:20:00Z',
    featured: true,
    verified: true,
    metadata: {
      complexity: 'advanced',
      useCase: 'Building production-ready RAG systems',
      steps: 24,
      estimatedTime: '45-60 minutes',
      prerequisites: ['Python programming', 'Vector databases', 'LLM basics'],
      compatibility: ['OpenAI API', 'Pinecone', 'Weaviate', 'ChromaDB'],
    },
  },
  {
    id: 'inst-002',
    name: 'Multi-Agent System Design',
    description: 'Comprehensive guide for designing and implementing multi-agent AI systems with coordination protocols, task distribution, and conflict resolution.',
    type: 'instructionSet',
    creator: {
      id: '6',
      name: 'Distributed AI Labs',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      verified: true,
    },
    price: {
      amount: 1.45,
      currency: 'ETH',
    },
    tags: ['multi-agent', 'coordination', 'distributed', 'ai-systems'],
    category: 'AI Architecture',
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
    featured: false,
    verified: true,
    metadata: {
      complexity: 'advanced',
      useCase: 'Enterprise multi-agent systems',
      steps: 32,
      estimatedTime: '90-120 minutes',
      prerequisites: ['Distributed systems', 'AI frameworks', 'Message queues'],
      compatibility: ['LangChain', 'CrewAI', 'AutoGen', 'Custom frameworks'],
    },
  },

  // Prompt Sets
  {
    id: 'prompt-001',
    name: 'Creative Writing Mastery Prompts',
    description: 'Collection of 150+ carefully crafted prompts for creative writing, storytelling, character development, and narrative structure across multiple genres.',
    type: 'promptSet',
    creator: {
      id: '7',
      name: 'Literary AI Collective',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      verified: true,
    },
    price: {
      amount: 0.35,
      currency: 'ETH',
    },
    tags: ['creative-writing', 'storytelling', 'literature', 'fiction'],
    category: 'Creative & Content',
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
    featured: true,
    verified: true,
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
    creator: {
      id: '8',
      name: 'DevOps Automation',
      avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face',
      verified: false,
    },
    price: {
      amount: 0.85,
      currency: 'ETH',
    },
    tags: ['code-review', 'security', 'optimization', 'development'],
    category: 'Development & DevOps',
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
    featured: false,
    verified: false,
    metadata: {
      prompts: 89,
      models: ['GPT-4', 'Claude-3', 'CodeLlama'],
      themes: ['Security Analysis', 'Performance', 'Best Practices', 'Refactoring'],
      difficulty: 'advanced',
      responseType: 'Code Analysis',
      languages: ['Python', 'JavaScript', 'TypeScript', 'Go', 'Rust'],
    },
  },
];

export const mockStats: MarketplaceStats = {
  totalItems: 1847,
  totalCreators: 342,
  totalSales: 15680,
  categories: {
    'AI Architecture': 156,
    'Natural Language Processing': 234,
    'Computer Vision': 189,
    'Finance & Trading': 167,
    'Healthcare & Medicine': 145,
    'Creative & Content': 298,
    'Development & DevOps': 201,
    'Data Science': 223,
    'Automation': 134,
    'Security': 100,
  },
};

export const featuredItems = mockMarketplaceData.filter(item => item.featured);

export const categories = [
  'All Categories',
  'AI Architecture',
  'Natural Language Processing',
  'Computer Vision',
  'Finance & Trading',
  'Healthcare & Medicine',
  'Creative & Content',
  'Development & DevOps',
  'Data Science',
  'Automation',
  'Security',
];

export const popularTags = [
  'nlp', 'machine-learning', 'api', 'automation', 'finance', 
  'healthcare', 'computer-vision', 'creative-writing', 'security',
  'data-analysis', 'real-time', 'optimization', 'ai-agents'
]; 