import { useState } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { Badge } from "@/src/lib/components/ui/badge";
import { Input } from "@/src/lib/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select";
import { Skeleton } from "@/src/lib/components/ui/skeleton";
import Icon from "@/src/lib/components/custom/Icon";
import { Link } from "@tanstack/react-router";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";

export default function WorkflowsPage() {
  const api = useHaitheApi();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get profile data
  const profileQuery = api.profile();

  // Loading state
  if (profileQuery.isPending) {
    return (
      <div className="min-h-full bg-background p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!profileQuery.data) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Icon name="GitBranch" className="size-16 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Authentication Required</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please log in to view your workflows.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for now - replace with actual API calls when available
  const workflows = [];

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-foreground leading-tight">
                AI Workflows
              </h1>
              <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl">
                Design and orchestrate complex AI workflows with multiple agents
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workflows</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Workflows Grid */}
        {workflows.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="GitBranch" className="size-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No workflows found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first AI workflow to orchestrate multiple agents and automate complex processes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Workflow cards would go here */}
          </div>
        )}
      </div>
    </div>
  );
} 