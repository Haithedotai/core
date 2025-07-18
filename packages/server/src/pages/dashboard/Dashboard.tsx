import { useState, useEffect } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Separator } from "@/src/lib/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/lib/components/ui/tabs";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { useAppStore } from "@/src/lib/stores/useAppStore";
import type { MarketplaceItem, Project, Validation, Purchase, DashboardStats } from "@/src/lib/types";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  description?: string;
  gradient?: string;
}

function StatsCard({ title, value, icon, trend, description, gradient = "from-blue-500 to-blue-600" }: StatsCardProps) {
  const renderIcon = () => {
    const iconProps = "h-6 w-6 text-white";
    switch (icon) {
      case 'Package': return <Icon name="Package" className={iconProps} />;
      case 'ShoppingCart': return <Icon name="ShoppingCart" className={iconProps} />;
      case 'DollarSign': return <Icon name="DollarSign" className={iconProps} />;
      case 'Download': return <Icon name="Download" className={iconProps} />;
      case 'FolderOpen': return <Icon name="FolderOpen" className={iconProps} />;
      case 'ShoppingBag': return <Icon name="ShoppingBag" className={iconProps} />;
      case 'TrendingUp': return <Icon name="TrendingUp" className={iconProps} />;
      default: return <Icon name="Package" className={iconProps} />;
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-90`} />
      <CardContent className="relative p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-white/20 backdrop-blur-sm`}>
            {renderIcon()}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm`}>
              {trend.positive ? (
                <Icon name="TrendingUp" className="size-3" />
              ) : (
                <Icon name="TrendingDown" className="size-3" />
              )}
              {trend.positive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-3xl font-bold leading-none group-hover:scale-105 transition-transform duration-300">
            {value}
          </div>
          <div className="text-sm font-medium opacity-90 leading-relaxed">
            {title}
          </div>
          {description && (
            <div className="text-xs opacity-75 leading-relaxed">
              {description}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ItemCardProps {
  item: MarketplaceItem;
  showActions?: boolean;
  onEdit?: (item: MarketplaceItem) => void;
  onView?: (item: MarketplaceItem) => void;
}

function ItemCard({ item, showActions = false, onEdit, onView }: ItemCardProps) {
  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case 'certified': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getItemTypeIcon = () => {
    const iconProps = "size-5 text-primary";
    switch (item.type) {
      case 'knowledge_base': return <Icon name="Brain" className={iconProps} />;
      case 'tool': return <Icon name="Wrench" className={iconProps} />;
      case 'mcp': return <Icon name="Wifi" className={iconProps} />;
      case 'prompt_set': return <Icon name="MessageSquare" className={iconProps} />;
      default: return <Icon name="Package" className={iconProps} />;
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border border-border/50 group">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors duration-300">
            {getItemTypeIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                {item.name}
              </CardTitle>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-primary mb-1">
                  ${item.price}
                </div>
                {item.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Icon name="Star" className="size-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{item.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-xs font-medium">
                {item.type.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={`text-xs font-medium border ${getValidationStatusColor(item.validation_status)}`}>
                {item.validation_status === 'certified' && <Icon name="ShieldCheck" className="size-3 mr-1" />}
                {item.validation_status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardDescription className="line-clamp-3 mb-6 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </CardDescription>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Icon name="Download" className="size-4" />
            <span className="font-medium">{item.downloads.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="MessageSquare" className="size-4" />
            <span className="font-medium">{item.reviews_count}</span>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => onView?.(item)} className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
              <Icon name="Eye" className="size-4 mr-2" />
              View
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit?.(item)} className="flex-1 hover:bg-secondary hover:text-secondary-foreground transition-colors duration-300">
              <Icon name="Pencil" className="size-4 mr-2" />
              Edit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ProjectCardProps {
  project: Project;
  onView?: (project: Project) => void;
  onEdit?: (project: Project) => void;
}

function ProjectCard({ project, onView, onEdit }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
      case 'development': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'paused': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
      case 'archived': return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border border-border/50 group">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 group-hover:bg-primary/10 transition-colors duration-300">
            <Icon name="FolderOpen" className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight mb-3">
              {project.name}
            </CardTitle>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-xs font-medium">
                {project.project_type}
              </Badge>
              <Badge variant="outline" className={`text-xs font-medium border ${getStatusColor(project.status)}`}>
                {project.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {project.description && (
          <CardDescription className="line-clamp-3 mb-6 text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </CardDescription>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Icon name="Package" className="size-4" />
            <span className="font-medium">{project.components.length} components</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Calendar" className="size-4" />
            <span className="font-medium">{new Date(project.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => onView?.(project)} className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
            <Icon name="Eye" className="size-4 mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit?.(project)} className="flex-1 hover:bg-secondary hover:text-secondary-foreground transition-colors duration-300">
            <Icon name="Pencil" className="size-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const {
    currentUser,
    currentOrganization,
    getDashboardStats,
    getItemsByProvider,
    fetchUserProjects,
    fetchValidations,
    fetchPurchases
  } = useAppStore();

  const [userItems, setUserItems] = useState<MarketplaceItem[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userValidations, setUserValidations] = useState<Validation[]>([]);
  const [userPurchases, setUserPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<DashboardStats>({});

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;

    try {
      // Load all user data
      const items = getItemsByProvider(currentUser.id);
      setUserItems(items);

      const projects = await fetchUserProjects(currentUser.id);
      setUserProjects(projects);

      const purchases = await fetchPurchases(currentUser.id);
      setUserPurchases(purchases);

      const validations = await fetchValidations(currentUser.id);
      setUserValidations(validations);

      // Get stats
      const dashboardStats = getDashboardStats(currentUser.id);
      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-full bg-gradient-to-br from-background via-background/95 to-muted/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-0 shadow-2xl">
          <CardContent className="text-center space-y-8 p-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="User" className="size-10 text-primary" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold leading-tight">Welcome to Haithe</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect your wallet to access your personalized dashboard and start building with AI.
              </p>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link to="/">
                <Icon name="Wallet" className="size-4 mr-2" />
                Connect Wallet
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background/95 to-muted/10">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm supports-[backdrop-filter]:bg-card/20">
        <div className="max-w-7xl mx-auto px-6 py-8 @lg/main:py-12">
          <div className="flex flex-col @lg/main:flex-row @lg/main:items-center @lg/main:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {currentUser.name?.[0] || 'U'}
                </div>
                <div>
                  <h1 className="text-3xl @lg/main:text-4xl font-bold text-foreground leading-tight">
                    Welcome back, {currentUser.name || 'User'}!
                  </h1>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Manage your AI projects and marketplace presence
                  </p>
                </div>
              </div>
            </div>

            {currentOrganization && (
              <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/80">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon name="Building" className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{currentOrganization.name}</div>
                    <div className="text-sm text-muted-foreground">Organization</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 @lg/main:py-12">
        <div className="space-y-12">
          {/* Stats */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Overview</h2>
              <p className="text-muted-foreground">Your activity across the platform</p>
            </div>
            <div className="grid grid-cols-1 @3xl/main:grid-cols-2 gap-6">
              <StatsCard
                title="Marketplace Items"
                value={stats.total_items || 0}
                icon="Package"
                description="Items created"
                gradient="from-blue-500 to-blue-600"
                trend={{ value: 12, positive: true }}
              />
              <StatsCard
                title="Active Projects"
                value={stats.total_projects || 0}
                icon="FolderOpen"
                description="Projects in progress"
                gradient="from-emerald-500 to-emerald-600"
                trend={{ value: 8, positive: true }}
              />
              <StatsCard
                title="Total Purchases"
                value={stats.total_purchases || 0}
                icon="ShoppingBag"
                description="Items purchased"
                gradient="from-purple-500 to-purple-600"
              />
              <StatsCard
                title="Sales Revenue"
                value={`$${stats.total_revenue?.toFixed(2) || '0.00'}`}
                icon="DollarSign"
                description="Total earnings"
                gradient="from-amber-500 to-amber-600"
                trend={{ value: 23, positive: true }}
              />
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Quick Actions</h2>
              <p className="text-muted-foreground">Get started with common tasks</p>
            </div>
            <div className="grid grid-cols-1 @3xl/main:grid-cols-2 gap-6">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <Link to="/create" className="block h-full">
                  <CardContent className="p-6 h-full flex flex-col items-center text-center space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
                    <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon name="Plus" className="size-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">Create Item</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">Build a new marketplace offering</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <Link to="/create" className="block h-full">
                  <CardContent className="p-6 h-full flex flex-col items-center text-center space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
                    <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon name="FolderOpen" className="size-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">New Project</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">Start building your AI solution</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <Link to="/create" className="block h-full">
                  <CardContent className="p-6 h-full flex flex-col items-center text-center space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
                    <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon name="ShoppingBag" className="size-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">Browse Marketplace</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">Buy an item from the marketplace</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                <Link to="/create" className="block h-full">
                  <CardContent className="p-6 h-full flex flex-col items-center text-center space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all duration-300">
                    <div className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon name="TrendingUp" className="size-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">View Analytics</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">Track your performance metrics</p>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Recent Activity</h2>
              <p className="text-muted-foreground">Your latest projects and marketplace activity</p>
            </div>

            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 h-auto">
                <TabsTrigger value="items" className="text-base py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Icon name="Package" className="size-4 mr-2" />
                  Items ({userItems.length})
                </TabsTrigger>
                <TabsTrigger value="projects" className="text-base py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Icon name="FolderOpen" className="size-4 mr-2" />
                  Projects ({userProjects.length})
                </TabsTrigger>
                <TabsTrigger value="purchases" className="text-base py-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Icon name="ShoppingBag" className="size-4 mr-2" />
                  Purchases ({userPurchases.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="mt-0">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-6 bg-gradient-to-r from-card to-card/80">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Icon name="Package" className="size-6 text-primary" />
                        Your Marketplace Items
                      </CardTitle>
                      <Button asChild className="shadow-lg">
                        <Link to="/create">
                          <Icon name="Plus" className="size-4 mr-2" />
                          Create New
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {userItems.length === 0 ? (
                      <div className="text-center py-16 space-y-8">
                        <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="Package" className="size-12 text-primary" />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-2xl font-d leading-tight">Ready to create?</h3>
                          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                            Share your AI expertise with the community. Create your first marketplace item and start earning.
                          </p>
                        </div>
                        <Button asChild size="lg" className="shadow-lg">
                          <Link to="/create">
                            <Icon name="Plus" className="size-4 mr-2" />
                            Create Your First Item
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 @4xl/main:grid-cols-2 gap-6">
                        {userItems.slice(0, 6).map((item) => (
                          <ItemCard
                            key={item.id}
                            item={item}
                            showActions={true}
                            onView={(item) => console.log('View item:', item.id)}
                            onEdit={(item) => console.log('Edit item:', item.id)}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="mt-0">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-6 bg-gradient-to-r from-card to-card/80">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Icon name="FolderOpen" className="size-6 text-primary" />
                        Your Projects
                      </CardTitle>
                      <Button variant="outline" asChild className="shadow-lg">
                        <Link to="/projects">
                          <Icon name="ArrowRight" className="size-4 ml-2" />
                          View All
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {userProjects.length === 0 ? (
                      <div className="text-center py-16 space-y-8">
                        <div className="w-24 h-24 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                          <Icon name="FolderOpen" className="size-12 text-emerald-600" />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold leading-tight">Start building</h3>
                          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                            Create your first AI project and bring your ideas to life with our powerful tools.
                          </p>
                        </div>
                        <Button asChild size="lg" className="shadow-lg bg-emerald-600 hover:bg-emerald-700">
                          <Link to="/projects">
                            <Icon name="Plus" className="size-4 mr-2" />
                            Create Your First Project
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 @4xl/main:grid-cols-2 gap-6">
                        {userProjects.slice(0, 6).map((project) => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            onView={(project) => console.log('View project:', project.id)}
                            onEdit={(project) => console.log('Edit project:', project.id)}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="purchases" className="mt-0">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-6 bg-gradient-to-r from-card to-card/80">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Icon name="ShoppingBag" className="size-6 text-primary" />
                        Your Purchases
                      </CardTitle>
                      <Button variant="outline" asChild className="shadow-lg">
                        <Link to="/purchases">
                          <Icon name="ArrowRight" className="size-4 ml-2" />
                          View All
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {userPurchases.length === 0 ? (
                      <div className="text-center py-16 space-y-8">
                        <div className="w-24 h-24 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                          <Icon name="ShoppingBag" className="size-12 text-purple-600" />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold leading-tight">Discover AI tools</h3>
                          <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                            Explore our marketplace to find AI tools and components that will accelerate your projects.
                          </p>
                        </div>
                        <Button asChild size="lg" className="shadow-lg bg-purple-600 hover:bg-purple-700">
                          <Link to="/marketplace">
                            <Icon name="Store" className="size-4 mr-2" />
                            Browse Marketplace
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userPurchases.slice(0, 5).map((purchase) => (
                          <Card key={purchase.id} className="border border-border/50 hover:shadow-md transition-shadow duration-300">
                            <CardContent className="flex items-center justify-between p-6">
                              <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                                  <Icon name="Package" className="size-5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                  <div className="font-semibold leading-relaxed">Purchase #{purchase.id.slice(-6)}</div>
                                  <div className="text-sm text-muted-foreground leading-relaxed">
                                    ${purchase.amount} • {new Date(purchase.purchased_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 font-medium">
                                {purchase.status}
                              </Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  );
} 