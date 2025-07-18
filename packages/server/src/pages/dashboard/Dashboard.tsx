import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/lib/components/ui/avatar";
import Icon from "@/src/lib/components/custom/Icon";
import { usePrivy } from "@privy-io/react-auth";
import { Link } from "@tanstack/react-router";
import mockData from "@/src/lib/data/mockData.json";
import { Image } from "@/src/lib/components/custom/Image";

export default function DashboardPage() {
  const { user } = usePrivy();
  const [selectedOrg, setSelectedOrg] = useState(mockData.organizations[0]);
  
  // Mock user data - replace with actual API calls
  const userOrgs = mockData.organizations.filter(org => 
    mockData.organization_members.some(member => 
      member.organization_id === org.id && 
      member.user_id === "user_1" // Replace with actual user ID
    )
  );
  
  const orgProjects = mockData.projects.filter(project => 
    project.organization_id === selectedOrg?.id
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "development": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "paused": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "archived": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case "conversational": return "MessageSquare";
      case "analysis": return "BarChart";
      case "generation": return "FileText";
      case "classification": return "Tags";
      default: return "Zap";
    }
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground text-lg">
                Manage your AI projects and organization
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline">
                <Icon name="Settings" className="w-4 h-4 mr-2" />
                Organization Settings
              </Button>
              <Button>
                <Icon name="Plus" className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Organization Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Organization Card */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                    {selectedOrg?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{selectedOrg?.name}</h2>
                  <p className="text-muted-foreground mb-4">{selectedOrg?.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" className="w-4 h-4" />
                      Created {new Date(selectedOrg?.created_at || "").toLocaleDateString()}
                    </div>
                    {selectedOrg?.website && (
                      <div className="flex items-center gap-1">
                        <Icon name="Globe" className="w-4 h-4" />
                        <a 
                          href={selectedOrg.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Zap" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{orgProjects.length}</p>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {orgProjects.filter(p => p.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Deployed</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Projects</h3>
              <p className="text-muted-foreground">Manage your AI model projects</p>
            </div>
            <Button>
              <Icon name="Plus" className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>

          {orgProjects.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Zap" className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">No projects yet</h4>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get started by creating your first AI project. You can build conversational AI, analysis tools, or content generators.
              </p>
              <Button>
                <Icon name="Plus" className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orgProjects.map((project) => (
                <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Image src="/static/haitheLogo.png" alt="Haithe Logo" className="w-12 h-12 rounded-lg" />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={getStatusColor(project.status)}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-foreground mb-2">{project.name}</h4>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="capitalize">{project.model_type}</span>
                    <span>{project.privacy}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Icon name="Settings" className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                                         <Button 
                       size="sm" 
                       className="flex-1"
                       onClick={() => window.location.href = `/model/${project.id}`}
                     >
                       <Icon name="ExternalLink" className="w-4 h-4 mr-1" />
                       View
                     </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Icon name="FileText" className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Documentation</h4>
                  <p className="text-xs text-muted-foreground">API guides & tutorials</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                                     <Icon name="Activity" className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Analytics</h4>
                  <p className="text-xs text-muted-foreground">Usage & performance</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Icon name="Key" className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">API Keys</h4>
                  <p className="text-xs text-muted-foreground">Manage access keys</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Icon name="Headphones" className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Support</h4>
                  <p className="text-xs text-muted-foreground">Get help & feedback</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 