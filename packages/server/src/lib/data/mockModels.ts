export interface Model {
    id: string;
    name: string;
    description: string;
    creator: {
        name: string;
        avatar: string;
        verified: boolean;
    };
    tags: string[];
    createdAt: string;
    lastUpdated: string;
    usageCount: number;
    rating: number;
    status: "active" | "maintenance" | "deprecated";
    type: string;
}

export const mockModels: Model[] = [
    {
        id: "1",
        name: "FinanceGPT Pro",
        description: "Advanced financial analysis AI that provides real-time market insights, portfolio optimization, and risk assessment.",
        creator: {
            name: "Sarah Chen",
            avatar: "SC",
            verified: true
        },
        tags: ["Finance", "Analytics", "Real-time"],
        createdAt: "2024-01-15",
        lastUpdated: "2024-01-20",
        usageCount: 1247,
        rating: 4.8,
        status: "active",
        type: "Analysis"
    },
    {
        id: "2",
        name: "CodeReview Assistant",
        description: "AI-powered code reviewer that identifies bugs, suggests optimizations, and ensures best practices across multiple languages.",
        creator: {
            name: "Alex Rodriguez",
            avatar: "AR",
            verified: true
        },
        tags: ["Development", "Code Review", "Multi-language"],
        createdAt: "2024-01-12",
        lastUpdated: "2024-01-18",
        usageCount: 892,
        rating: 4.6,
        status: "active",
        type: "Developer Tool"
    },
    {
        id: "3",
        name: "Medical Diagnosis Aid",
        description: "Specialized AI for preliminary medical diagnosis assistance, trained on extensive medical literature and case studies.",
        creator: {
            name: "Dr. Emily Watson",
            avatar: "EW",
            verified: true
        },
        tags: ["Healthcare", "Diagnosis", "Medical"],
        createdAt: "2024-01-10",
        lastUpdated: "2024-01-19",
        usageCount: 2156,
        rating: 4.9,
        status: "active",
        type: "Healthcare"
    },
    {
        id: "4",
        name: "Creative Writing Partner",
        description: "AI writing companion that helps with storytelling, character development, and creative narrative construction.",
        creator: {
            name: "Marcus Thompson",
            avatar: "MT",
            verified: false
        },
        tags: ["Writing", "Creative", "Storytelling"],
        createdAt: "2024-01-08",
        lastUpdated: "2024-01-16",
        usageCount: 634,
        rating: 4.4,
        status: "active",
        type: "Creative"
    },
    {
        id: "5",
        name: "Research Synthesizer",
        description: "Academic research assistant that analyzes papers, extracts key insights, and generates comprehensive literature reviews.",
        creator: {
            name: "Prof. Lisa Kim",
            avatar: "LK",
            verified: true
        },
        tags: ["Research", "Academic", "Analysis"],
        createdAt: "2024-01-05",
        lastUpdated: "2024-01-17",
        usageCount: 1089,
        rating: 4.7,
        status: "active",
        type: "Research"
    },
    {
        id: "6",
        name: "Marketing Strategy AI",
        description: "AI strategist for marketing campaigns, audience analysis, and content optimization across digital platforms.",
        creator: {
            name: "Jennifer Park",
            avatar: "JP",
            verified: true
        },
        tags: ["Marketing", "Strategy", "Content"],
        createdAt: "2024-01-03",
        lastUpdated: "2024-01-14",
        usageCount: 756,
        rating: 4.5,
        status: "active",
        type: "Marketing"
    },
    {
        id: "7",
        name: "Language Tutor Bot",
        description: "Personalized language learning assistant with conversation practice, grammar correction, and cultural insights.",
        creator: {
            name: "Carlos Mendez",
            avatar: "CM",
            verified: false
        },
        tags: ["Education", "Language", "Learning"],
        createdAt: "2023-12-28",
        lastUpdated: "2024-01-13",
        usageCount: 1834,
        rating: 4.6,
        status: "active",
        type: "Education"
    },
    {
        id: "8",
        name: "Data Visualization Expert",
        description: "AI that transforms raw data into compelling visualizations and interactive dashboards with insightful commentary.",
        creator: {
            name: "Rachel Zhang",
            avatar: "RZ",
            verified: true
        },
        tags: ["Data", "Visualization", "Analytics"],
        createdAt: "2023-12-25",
        lastUpdated: "2024-01-11",
        usageCount: 945,
        rating: 4.8,
        status: "maintenance",
        type: "Data Science"
    },
    {
        id: "9",
        name: "Customer Support AI",
        description: "Intelligent customer service agent with multilingual support, sentiment analysis, and escalation management.",
        creator: {
            name: "David Kim",
            avatar: "DK",
            verified: true
        },
        tags: ["Support", "Customer Service", "Multilingual"],
        createdAt: "2023-12-20",
        lastUpdated: "2024-01-09",
        usageCount: 2891,
        rating: 4.3,
        status: "active",
        type: "Customer Service"
    },
    {
        id: "10",
        name: "Legal Document Analyzer",
        description: "AI legal assistant for contract analysis, clause extraction, and legal risk assessment with regulatory compliance.",
        creator: {
            name: "Amanda Foster",
            avatar: "AF",
            verified: true
        },
        tags: ["Legal", "Contracts", "Compliance"],
        createdAt: "2023-12-18",
        lastUpdated: "2024-01-07",
        usageCount: 567,
        rating: 4.9,
        status: "active",
        type: "Legal"
    },
    {
        id: "11",
        name: "Travel Planner Pro",
        description: "Comprehensive travel planning AI with real-time pricing, itinerary optimization, and local recommendations.",
        creator: {
            name: "Michael Brown",
            avatar: "MB",
            verified: false
        },
        tags: ["Travel", "Planning", "Recommendations"],
        createdAt: "2023-12-15",
        lastUpdated: "2024-01-05",
        usageCount: 1123,
        rating: 4.4,
        status: "active",
        type: "Lifestyle"
    },
    {
        id: "12",
        name: "Investment Advisor AI",
        description: "Personal investment advisor with portfolio analysis, risk assessment, and market trend predictions.",
        creator: {
            name: "Robert Wilson",
            avatar: "RW",
            verified: true
        },
        tags: ["Investment", "Portfolio", "Finance"],
        createdAt: "2023-12-12",
        lastUpdated: "2024-01-03",
        usageCount: 2045,
        rating: 4.7,
        status: "active",
        type: "Finance"
    }
]; 