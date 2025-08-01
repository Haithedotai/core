import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "../../../lib/components/ui/button";
import { Badge } from "../../../lib/components/ui/badge";
import { Separator } from "../../../lib/components/ui/separator";
import { Checkbox } from "../../../lib/components/ui/checkbox";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../lib/components/ui/sheet";
import { categories } from "../mockData";
import Icon from "@/src/lib/components/custom/Icon";
import { FileText, Code, Database, Link as LinkIcon, MessageSquare } from "lucide-react";
import { useMarketplaceStore } from "../../../lib/hooks/use-store";

export default function MarketplaceMobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const { filters, updateFilters } = useMarketplaceStore();

  // Ensure filters is always an object
  const safeFilters = filters || {};

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleCategoryClick = (category: any) => {
    const currentCategories = Array.isArray(safeFilters.category) ? safeFilters.category : [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c: any) => c !== category)
      : [...currentCategories, category];
    updateFilters({ category: newCategories.length > 0 ? newCategories : undefined });
  };

  const isCategoryActive = (category: any) => {
    if (!Array.isArray(safeFilters.category)) return false;
    return safeFilters.category.includes(category);
  };

  const NavigationContent = () => (
    <div className="flex flex-col w-full gap-4 px-4 py-2">
      {/* Marketplace Overview */}
      <div className="space-y-2">
        <Button
          variant={isActive("/marketplace") && pathname === "/marketplace" ? "default" : "ghost"}
          className="w-full justify-start h-10"
          asChild
          onClick={handleLinkClick}
        >
          <Link to="/marketplace">
            <Icon name="ShoppingBag" className="size-4" />
            Explore All
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start h-10" onClick={handleLinkClick}>
          <Icon name="TrendingUp" className="size-4" />
          Trending Now
        </Button>
      </div>

      <Separator />

      {/* Knowledge Types */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
          Filters
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-2 py-1.5 rounded-md">
            <Checkbox
              id="mobile-knowledge-text"
              checked={isCategoryActive('knowledge:text')}
              onCheckedChange={() => handleCategoryClick('knowledge:text')}
            />
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
              <FileText className="size-4 mr-2" />
              Text Knowledge
            </label>
          </div>
          <div className="flex items-center space-x-2 px-2 py-1.5 rounded-md">
            <Checkbox
              id="mobile-knowledge-html"
              checked={isCategoryActive('knowledge:html')}
              onCheckedChange={() => handleCategoryClick('knowledge:html')}
            />
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
              <Code className="size-4 mr-2" />
              HTML Knowledge
            </label>
          </div>
          <div className="flex items-center space-x-2 px-2 py-1.5 rounded-md">
            <Checkbox
              id="mobile-knowledge-pdf"
              checked={isCategoryActive('knowledge:pdf')}
              onCheckedChange={() => handleCategoryClick('knowledge:pdf')}
            />
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
              <FileText className="size-4 mr-2" />
              PDF Knowledge
            </label>
          </div>
          <div className="flex items-center space-x-2 px-2 py-1.5 rounded-md">
            <Checkbox
              id="mobile-knowledge-csv"
              checked={isCategoryActive('knowledge:csv')}
              onCheckedChange={() => handleCategoryClick('knowledge:csv')}
            />
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
              <Database className="size-4 mr-2" />
              CSV Knowledge
            </label>
          </div>
          <div className="flex items-center space-x-2 px-2 py-1.5 rounded-md">
            <Checkbox
              id="mobile-knowledge-url"
              checked={isCategoryActive('knowledge:url')}
              onCheckedChange={() => handleCategoryClick('knowledge:url')}
            />
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
              <LinkIcon className="size-4 mr-2" />
              URL Knowledge
            </label>
          </div>
          <div className="flex items-center space-x-2 px-2 py-1.5 rounded-md">
            <Checkbox
              id="mobile-promptset"
              checked={isCategoryActive('promptset')}
              onCheckedChange={() => handleCategoryClick('promptset')}
            />
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
              <MessageSquare className="size-4 mr-2" />
              Prompt Sets
            </label>
          </div>
          <div className="flex items-center space-x-2 px-2 py-1.5 rounded-md">
            <Checkbox
              id="mobile-tool-rpc"
              checked={isCategoryActive('tool:rpc')}
              onCheckedChange={() => handleCategoryClick('tool:rpc')}
            />
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
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
            <Icon name="LayoutDashboard" className="size-4" />
            Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
        >
          {/* Use a Lucide icon for menu */}
          <span className="sr-only">Toggle marketplace navigation</span>
          <Icon name="Menu" className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="">
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <SheetTitle className="flex items-center gap-2">
            <div>
              <span className="text-lg font-bold">Marketplace</span>
              <p className="text-xs text-muted-foreground font-normal">AI Assets & Tools</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="overflow-y-auto">
          <NavigationContent />
        </div>
      </SheetContent>
    </Sheet>
  );
} 