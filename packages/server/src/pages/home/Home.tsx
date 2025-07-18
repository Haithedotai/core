import { useState, useMemo } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Card } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Avatar } from "@/src/lib/components/ui/avatar";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { mockModels } from "@/src/lib/data/mockModels";

const ITEMS_PER_PAGE = 6;

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Filter models based on search query
    const filteredModels = useMemo(() => {
        if (!searchQuery.trim()) return mockModels;

        const query = searchQuery.toLowerCase();
        return mockModels.filter(model =>
            model.name.toLowerCase().includes(query) ||
            model.description.toLowerCase().includes(query) ||
            model.tags.some(tag => tag.toLowerCase().includes(query)) ||
            model.creator.name.toLowerCase().includes(query) ||
            model.type.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    // Paginate filtered results
    const paginatedModels = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredModels.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredModels, currentPage]);

    const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);

    // Reset to first page when search changes
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

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

    return (
        <div className="min-h-full bg-background">
            {/* Header Section */}
            <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-foreground">Browse Models</h1>
                            <p className="text-muted-foreground text-lg">
                                Discover and explore context-aware models created by our community
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-md">
                            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search models, creators, or tags..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10 bg-background/80"
                            />
                        </div>

                        {/* Results Summary */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                                {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''} found
                            </span>
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSearch("")}
                                    className="text-primary hover:text-primary/80"
                                >
                                    Clear search
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Models Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {paginatedModels.length === 0 ? (
                    <div className="text-center py-16">
                        <Icon name="Brain" className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No models found</h3>
                        <p className="text-muted-foreground">
                            {searchQuery
                                ? "Try adjusting your search criteria or browse all models"
                                : "No models available at the moment"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 @3xl/main:grid-cols-2 gap-6">
                        {paginatedModels.map((model) => (
                            <Card key={model.id} className="group hover:shadow-lg transition-all duration-200 border-border bg-card">
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                    {model.name}
                                                </h3>
                                                <Badge className={getStatusColor(model.status)} variant="secondary">
                                                    {model.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-primary/80 font-medium">{model.type}</p>
                                        </div>
                                        <Link to="/model/$id" params={{ id: model.id }}>
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Icon name="ExternalLink" className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Description */}
                                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                        {model.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {model.tags.slice(0, 3).map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {model.tags.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{model.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Icon name="MessageSquare" className="h-3 w-3" />
                                            {model.usageCount.toLocaleString()} uses
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Icon name="Star" className="h-3 w-3 fill-current" />
                                            {model.rating}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Icon name="Calendar" className="h-3 w-3" />
                                            {formatDate(model.createdAt)}
                                        </div>
                                    </div>

                                    {/* Creator */}
                                    <div className="flex items-center gap-2 pt-4 border-t border-border">
                                        <Avatar className="h-6 w-6">
                                            <div className="h-full w-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                {model.creator.avatar}
                                            </div>
                                        </Avatar>
                                        <span className="text-sm text-muted-foreground">{model.creator.name}</span>
                                        {model.creator.verified && (
                                            <div className="h-3 w-3 bg-primary rounded-full flex items-center justify-center">
                                                <div className="h-1.5 w-1.5 bg-primary-foreground rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "primary" : "ghost"}
                                    size="sm"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className="min-w-[2.5rem]"
                                >
                                    {pageNum}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}