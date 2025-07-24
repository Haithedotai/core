import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Separator } from "@/src/lib/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/lib/components/ui/tabs";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";

// Placeholder components for future implementation
function ModelsSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">AI Models</h2>
          <p className="text-muted-foreground">Discover and interact with AI models</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-[250px]"
          />
          <Button variant="outline">
            <Icon name="Funnel" className="size-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="text-center py-20 space-y-4">
        <Icon name="Bot" className="size-16 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <h3 className="text-xl font-medium">AI Models Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're working on integrating a comprehensive library of AI models. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
}

function MarketplaceSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Marketplace</h2>
          <p className="text-muted-foreground">Browse verified AI components and tools</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="min-w-[250px]"
          />
          <Button variant="outline">
            <Icon name="Funnel" className="size-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Item Type Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { type: 'knowledge_base', label: 'Knowledge Bases', icon: 'Brain', description: 'Pre-trained AI knowledge systems' },
          { type: 'tool', label: 'Tools', icon: 'Wrench', description: 'AI-powered functions and utilities' },
          { type: 'mcp', label: 'MCPs', icon: 'Wifi', description: 'Model Context Protocols' },
          { type: 'prompt_set', label: 'Prompt Sets', icon: 'MessageSquare', description: 'Curated conversation prompts' },
        ].map((category) => (
          <Card key={category.type} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <Icon name={category.icon as any} className="size-8 mx-auto mb-2 text-primary" />
              <CardTitle className="text-lg">{category.label}</CardTitle>
              <CardDescription className="text-sm">{category.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Badge variant="secondary" className="w-full justify-center">
                Coming Soon
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon Message */}
      <div className="text-center py-12 space-y-4">
        <Icon name="Store" className="size-16 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <h3 className="text-xl font-medium">Marketplace Coming Soon</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            We're building a comprehensive marketplace for AI components. Check back soon for the latest tools and resources!
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const api = useHaitheApi();
  const [activeTab, setActiveTab] = useState("models");

  // Check if user is logged in
  const isLoggedIn = api.isLoggedIn;
  const profileQuery = api.profile();

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-foreground leading-tight">
                Welcome to Haithe
              </h1>
              <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl">
                Discover, build, and deploy verified AI solutions with our comprehensive platform
              </p>
            </div>
            
            {isLoggedIn() && profileQuery.data ? (
              <div className="flex gap-3">
                <Button asChild>
                  <Link to="/dashboard">
                    <Icon name="LayoutDashboard" className="size-4 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex items-center justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="models" className="flex items-center gap-2">
                <Icon name="Bot" className="size-4" />
                Models
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="flex items-center gap-2">
                <Icon name="Store" className="size-4" />
                Marketplace
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="models" className="space-y-0">
            <ModelsSection />
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-0">
            <MarketplaceSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}