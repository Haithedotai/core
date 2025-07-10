import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Avatar } from "@/src/lib/components/ui/avatar";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { mockModels } from "@/src/lib/data/mockModels";

export default function ModelPage() {
    const { id } = useParams({
        from: '/model/$id'
    });

    // Find the model by ID
    const model = useMemo(() => {
        return mockModels.find(m => m.id === id);
    }, [id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
            case "maintenance": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
            case "deprecated": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-grey-100 text-grey-800 dark:bg-grey-900/30 dark:text-grey-400";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // If model not found, show error state
    if (!model) {
        return (
            <div className="min-h-full bg-background">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="text-center">
                        <Icon name="Brain" className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">Model Not Found</h1>
                        <p className="text-muted-foreground mb-6">
                            The model with ID "{id}" could not be found.
                        </p>
                        <Link to="/">
                            <Button>
                                <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
                                Back to Browse Models
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-background">
            {/* Header Section */}
            <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="flex flex-col gap-4 sm:gap-6">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Link to="/">
                                <Button variant="outline" className="w-full sm:w-auto">
                                    <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </Link>
                            <Link to="/" className="hover:text-primary transition-colors">
                                Browse Models
                            </Link>
                            <Icon name="ChevronRight" className="h-4 w-4" />
                            <span className="text-foreground truncate">{model.name}</span>
                        </div>

                        {/* Model Header */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">{model.name}</h1>
                                        <Badge className={getStatusColor(model.status)} variant="secondary">
                                            {model.status}
                                        </Badge>
                                    </div>
                                    <p className="text-base sm:text-lg text-primary/80 font-medium mb-3">{model.type}</p>
                                    <p className="text-muted-foreground text-base sm:text-lg">
                                        {model.description}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                    <Link to="/model/$id/chat" params={{ id: model.id }}>
                                        <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                                            <Icon name="MessageCircle" className="h-5 w-5" />
                                            Start Chat
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {model.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs sm:text-sm">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Icon name="MessageSquare" className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{model.usageCount.toLocaleString()} uses</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon name="Star" className="h-4 w-4 flex-shrink-0 fill-current text-yellow-500" />
                                    <span className="truncate">{model.rating} rating</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon name="Calendar" className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">Created {formatDate(model.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon name="RefreshCw" className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">Updated {formatDate(model.lastUpdated)}</span>
                                </div>
                            </div>

                            {/* Creator */}
                            <div className="flex items-center gap-3 pt-4 border-t border-border">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                    <div className="h-full w-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                        {model.creator.avatar}
                                    </div>
                                </Avatar>
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-foreground font-medium truncate">Created by {model.creator.name}</span>
                                    {model.creator.verified && (
                                        <div className="h-4 w-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                            <div className="h-2 w-2 bg-primary-foreground rounded-full" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="max-w-full">
                    {/* Model Information */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-semibold text-foreground mb-6 text-xl">Model Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">Model Type</span>
                                        <p className="font-medium text-foreground">{model.type}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">Status</span>
                                        <Badge className={getStatusColor(model.status)} variant="secondary">
                                            {model.status}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">Total Uses</span>
                                        <p className="font-medium text-foreground">{model.usageCount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">User Rating</span>
                                        <p className="font-medium text-foreground">{model.rating}/5.0</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">Created</span>
                                        <p className="font-medium text-foreground">{formatDate(model.createdAt)}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">Last Updated</span>
                                        <p className="font-medium text-foreground">{formatDate(model.lastUpdated)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-foreground mb-4 text-xl">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {model.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs sm:text-sm">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}