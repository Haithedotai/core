import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "../../../lib/components/ui/button";
import { Separator } from "../../../lib/components/ui/separator";
import { Badge } from "../../../lib/components/ui/badge";
import { Checkbox } from "../../../lib/components/ui/checkbox";
import {
  Sparkles,
  Clock,
  Heart,
  ShoppingCart,
  FileText,
  Code,
  Database,
  Link as LinkIcon,
  MessageSquare,
} from "lucide-react";
import Icon from "@/src/lib/components/custom/Icon";
import type { MarketplaceCategory } from "../types";
import { useMarketplaceStore } from "../../../lib/hooks/use-store";

export default function MarketplaceSidebar() {
  const { pathname } = useLocation();
  const { filters, updateFilters } = useMarketplaceStore();
  
  // Ensure filters is always an object
  const safeFilters = filters || {};
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const handleCategoryClick = (category: MarketplaceCategory) => {
    const currentCategories = Array.isArray(safeFilters.category) ? safeFilters.category : [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c: MarketplaceCategory) => c !== category)
      : [...currentCategories, category];
    updateFilters({ category: newCategories.length > 0 ? newCategories : undefined });
  };

  const isCategoryActive = (category: MarketplaceCategory) => {
    if (!Array.isArray(safeFilters.category)) return false;
    return safeFilters.category.includes(category);
  };

  return (
    <div className="fixed top-[var(--navbar-height)] h-[calc(100dvh-var(--navbar-height))] w-[var(--sidebar-width)] left-0 z-40 border-r bg-background hidden lg:flex">
      <div className="flex flex-col w-full gap-4 px-4 py-6 overflow-y-auto">
        {/* Quick Browse */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
            Discover
          </p>
          <Button 
            variant={isActive("/marketplace") && pathname === "/marketplace" ? "default" : "ghost"} 
            className="w-full justify-start h-10" 
            asChild
          >
            <Link to="/marketplace">
              <Sparkles className="size-4 mr-3" />
              Explore All
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start h-10">
            <Icon name="TrendingUp" className="size-4 mr-3" />
            Trending Now
          </Button>
          <Button variant="ghost" className="w-full justify-start h-10">
            <Clock className="size-4 mr-3" />
            New Releases
          </Button>
        </div>

        <Separator />

        {/* Knowledge Types */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
            Knowledge
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-3 px-2 py-1.5 rounded-md">
              <Checkbox
                id="knowledge-text"
                checked={isCategoryActive('knowledge:text')}
                onCheckedChange={() => handleCategoryClick('knowledge:text')}
              />
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                <FileText className="size-4 mr-2" />
                Text Knowledge
              </label>
            </div>
            <div className="flex items-center space-x-3 px-2 py-1.5 rounded-md">
              <Checkbox
                id="knowledge-html"
                checked={isCategoryActive('knowledge:html')}
                onCheckedChange={() => handleCategoryClick('knowledge:html')}
              />
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                <Code className="size-4 mr-2" />
                HTML Knowledge
              </label>
            </div>
            <div className="flex items-center space-x-3 px-2 py-1.5 rounded-md">
              <Checkbox
                id="knowledge-pdf"
                checked={isCategoryActive('knowledge:pdf')}
                onCheckedChange={() => handleCategoryClick('knowledge:pdf')}
              />
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                <FileText className="size-4 mr-2" />
                PDF Knowledge
              </label>
            </div>
            <div className="flex items-center space-x-3 px-2 py-1.5 rounded-md">
              <Checkbox
                id="knowledge-csv"
                checked={isCategoryActive('knowledge:csv')}
                onCheckedChange={() => handleCategoryClick('knowledge:csv')}
              />
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                <Database className="size-4 mr-2" />
                CSV Knowledge
              </label>
            </div>
            <div className="flex items-center space-x-3 px-2 py-1.5 rounded-md">
              <Checkbox
                id="knowledge-url"
                checked={isCategoryActive('knowledge:url')}
                onCheckedChange={() => handleCategoryClick('knowledge:url')}
              />
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                <LinkIcon className="size-4 mr-2" />
                URL Knowledge
              </label>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tools & Prompts */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
            Tools & Prompts
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-3 px-2 py-1.5 rounded-md">
              <Checkbox
                id="promptset"
                checked={isCategoryActive('promptset')}
                onCheckedChange={() => handleCategoryClick('promptset')}
              />
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                <MessageSquare className="size-4 mr-2" />
                Prompt Sets
              </label>
            </div>
            <div className="flex items-center space-x-2 px-2 py-1.5 rounded-md">
              <Checkbox
                id="tool-rpc"
                checked={isCategoryActive('tool:rpc')}
                onCheckedChange={() => handleCategoryClick('tool:rpc')}
              />
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                <Code className="size-4 mr-2" />
                RPC Tools
              </label>
            </div>
          </div>
        </div>

        <Separator />

        {/* My Marketplace */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
            Navigation
          </p>
          <Button variant="ghost" className="w-full justify-start h-10" asChild>
            <Link to="/dashboard">
              <Icon name="LayoutDashboard" className="size-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 