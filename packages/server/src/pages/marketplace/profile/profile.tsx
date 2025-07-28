import { Button } from "../../../lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../lib/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../lib/components/ui/avatar";
import { Plus } from "lucide-react";
import MarketplaceItemCard from "../components/MarketplaceItemCard";
import type { MarketplaceItem } from "../types";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import { truncateText } from "@/src/lib/utils";

export default function ProfilePage() {
    // Mock data for AI marketplace creator - replace with actual data from your backend
    const creator = {
        name: "Alex Chen",
        description: "Full-stack developer and AI enthusiast. Building scalable AI solutions and sharing knowledge through practical implementations. Specializing in natural language processing and multi-agent systems.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        recentItems: [
            {
                id: "lambda-001",
                name: "Real-time Sentiment Analyzer",
                type: "lambda",
                description: "High-performance Lambda function for real-time sentiment analysis using advanced NLP models.",
                price: {
                    amount: 0.75,
                    currency: "USDT"
                },
                tags: ["nlp", "sentiment", "realtime", "api"],
                category: "Natural Language Processing",
                creator: {
                    id: "creator-001",
                    name: "Alex Chen",
                    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
                    verified: true,
                },
                rating: {
                    average: 4.7,
                    count: 203,
                },
                stats: {
                    downloads: 945,
                    favorites: 678,
                    views: 12300,
                },
                created_at: "2024-03-05T16:20:00Z",
                updated_at: "2024-11-30T09:10:00Z",
                metadata: {
                    runtime: "Python 3.11",
                    memory: "1 GB",
                    timeout: "30s",
                    triggers: ["HTTP API", "SQS", "EventBridge"],
                    apiEndpoints: 3,
                    language: "Python",
                },
            },
            {
                id: "kb-001",
                name: "Financial Market Analysis Database",
                type: "knowledgeBase",
                description: "Comprehensive database with 10+ years of financial market data and expert analysis.",
                price: {
                    amount: 2.5,
                    currency: "USDT"
                },
                tags: ["finance", "markets", "analysis", "trading"],
                category: "Finance & Trading",
                creator: {
                    id: "creator-001",
                    name: "Alex Chen",
                    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
                    verified: true,
                },
                rating: {
                    average: 4.8,
                    count: 342,
                },
                stats: {
                    downloads: 1250,
                    favorites: 890,
                    views: 15600,
                },
                created_at: "2024-01-15T10:30:00Z",
                updated_at: "2024-12-01T14:22:00Z",
                metadata: {
                    size: "12.3 GB",
                    documents: 45680,
                    sources: ["Bloomberg", "Reuters", "Financial Times", "SEC Filings"],
                    domains: ["finance", "economics", "cryptocurrency", "markets"],
                    lastUpdated: "2024-12-01T14:22:00Z",
                },
            },
            {
                id: "inst-001",
                name: "Advanced RAG Implementation Guide",
                type: "instructionSet",
                description: "Step-by-step instructions for implementing Retrieval-Augmented Generation systems.",
                price: {
                    amount: 0.95,
                    currency: "USDT"
                },
                tags: ["rag", "vector-db", "embeddings", "llm"],
                category: "AI Architecture",
                creator: {
                    id: "creator-001",
                    name: "Alex Chen",
                    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
                    verified: true,
                },
                rating: {
                    average: 4.9,
                    count: 167,
                },
                stats: {
                    downloads: 823,
                    favorites: 612,
                    views: 11400,
                },
                created_at: "2024-05-08T14:15:00Z",
                updated_at: "2024-11-29T13:20:00Z",
                metadata: {
                    complexity: "advanced",
                    useCase: "Building production-ready RAG systems",
                    steps: 24,
                    estimatedTime: "45-60 minutes",
                    prerequisites: ["Python programming", "Vector databases", "LLM basics"],
                    compatibility: ["OpenAI API", "Pinecone", "Weaviate", "ChromaDB"],
                },
            }
        ] as MarketplaceItem[]
    };
    const { id } = useParams({ from: "/marketplace/profile/$id" });
    const { data: creatorData, isFetching: isCreatorFetching } = useHaitheApi().getCreator(id);

    const navigate = useNavigate();

    const handleCreateNewItem = () => {
        navigate({ to: "/marketplace/create" });
    };

    const handleItemClick = (item: MarketplaceItem) => {
        // TODO: Navigate to item detail page
        console.log("Navigate to item:", item.id);
    };

    const handleFavorite = (itemId: string) => {
        // TODO: Handle favorite toggle
        console.log("Toggle favorite for item:", itemId);
    };

    return (
        <div className="min-h-full bg-background p-8">
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Developer Profile</h1>
                        <p className="text-muted-foreground mt-1">Manage your AI marketplace presence</p>
                    </div>
                    <Button
                        onClick={handleCreateNewItem}
                        variant="primary"
                        size="lg"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Item
                    </Button>
                </div>

                {/* Profile Card */}
                <Card>
                    <CardHeader className="pb-6">
                        <div className="flex items-start space-x-6">
                            <Avatar className="w-24 h-24 border-4 border-background shadow-sm">
                                <AvatarImage src={creatorData?.avatar} alt={creatorData?.name} />
                                <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                                    {creatorData?.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            {!isCreatorFetching ? (
                                <div className="flex-1 mt-4">
                                    <CardTitle className="text-2xl font-bold text-foreground mb-1">{creatorData?.name}</CardTitle>
                                    <p className="text-muted-foreground leading-relaxed max-w-2xl">
                                        {truncateText(creatorData?.description || "", 100)}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex-1 mt-6">
                                    <Skeleton className="h-5 w-32 mb-2" />
                                    <Skeleton className="h-4 w-72" />
                                </div>
                            )}
                        </div>
                    </CardHeader>
                </Card>

                {/* Recent Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-foreground">Recent AI Items</CardTitle>
                        <CardDescription>Your latest marketplace creations</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {creator.recentItems.map((item) => (
                                <MarketplaceItemCard
                                    key={item.id}
                                    item={item}
                                    onItemClick={handleItemClick}
                                    onFavorite={handleFavorite}
                                    isFavorited={false}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}