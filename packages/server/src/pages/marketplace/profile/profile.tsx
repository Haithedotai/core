import { Button } from "../../../lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../lib/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../lib/components/ui/avatar";
import { Plus } from "lucide-react";
import MarketplaceItemCard from "../components/MarketplaceItemCard";
import type { Product } from "../../../../../../services/shared/types";
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
    };
    const { id } = useParams({ from: "/marketplace/profile/$id" });
    const { data: creatorData, isFetching: isCreatorFetching } = useHaitheApi().getCreatorByAddress(id);
    const { data: creatorProducts, isFetching: isProductsFetching } = useHaitheApi().getCreatorProducts(id);

    console.log({ creatorData, creatorProducts })

    const navigate = useNavigate();

    const handleCreateNewItem = () => {
        navigate({ to: "/marketplace/create" });
    };

    const handleItemClick = (item: Product) => {
        // TODO: Navigate to item detail page
        console.log("Navigate to item:", item.id);
    };

    const handleFavorite = (itemId: number) => {
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
                                    {creatorData?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
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
                        {isProductsFetching ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="space-y-4">
                                        <Skeleton className="h-48 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : creatorProducts && creatorProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {creatorProducts.map((item) => (
                                    <MarketplaceItemCard
                                        key={item.id}
                                        item={item}
                                        onItemClick={handleItemClick}
                                        onFavorite={handleFavorite}
                                        isFavorited={false}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No products found for this creator.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}