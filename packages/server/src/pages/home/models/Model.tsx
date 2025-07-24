import { useParams } from "@tanstack/react-router";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";

export default function ModelPage() {
    const { id } = useParams({
        from: '/model/$id'
    });

    return (
        <div className="min-h-full bg-background">
            <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold text-foreground leading-tight">Model Details</h1>
                            <p className="text-muted-foreground text-xl leading-relaxed">
                                Model ID: {id}
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <Button asChild>
                                <Link to="/model/$id/chat" params={{ id }}>
                                    <Icon name="MessageSquare" className="size-4 mr-2" />
                                    Chat with Model
                                </Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="/">
                                    <Icon name="ArrowLeft" className="size-4 mr-2" />
                                    Back to Home
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center py-20 space-y-8">
                    <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="Bot" className="size-12 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold leading-tight">Model Page Coming Soon</h3>
                        <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                            Individual model pages will be available once we integrate with the AI model APIs.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-2xl mx-auto">
                        <Card className="text-center p-6 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4">
                                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
                                    <Icon name="Settings" className="size-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <CardTitle className="text-lg">Model Configuration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    View and configure model parameters, temperature, and other settings.
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="text-center p-6 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4">
                                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
                                    <Icon name="TrendingUp" className="size-6 text-green-600 dark:text-green-400" />
                                </div>
                                <CardTitle className="text-lg">Usage Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    Track usage statistics, token consumption, and performance metrics.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>

                    <Button asChild size="lg" className="mt-8">
                        <Link to="/model/$id/chat" params={{ id }}>
                            <Icon name="MessageSquare" className="size-4 mr-2" />
                            Try the Chat Interface
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}