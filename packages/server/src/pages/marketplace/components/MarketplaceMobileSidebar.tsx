import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "../../../lib/components/ui/button";
import { Badge } from "../../../lib/components/ui/badge";
import { Separator } from "../../../lib/components/ui/separator";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../lib/components/ui/sheet";
import { categories } from "../mockData";
import Icon from "@/src/lib/components/custom/Icon";

export default function MarketplaceMobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const marketplaceCategories = categories.filter(cat => cat !== 'All Categories');

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
            <Icon name="Sparkles" className="size-4 mr-3" />
            Explore All
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start h-10" onClick={handleLinkClick}>
          <Icon name="Crown" className="size-4 mr-3" />
          Premium Assets
        </Button>
        <Button variant="ghost" className="w-full justify-start h-10" onClick={handleLinkClick}>
          <Icon name="Zap" className="size-4 mr-3" />
          Trending Now
        </Button>
        <Button variant="ghost" className="w-full justify-start h-10" onClick={handleLinkClick}>
          <Icon name="Clock" className="size-4 mr-3" />
          New Releases
        </Button>
      </div>

      <Separator />

      {/* AI Asset Types - with emojis */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
          Asset Types
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-16 flex-col gap-1 text-xs" onClick={handleLinkClick}>
            <Icon name="Brain" className="size-4" />
            Knowledge
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-1 text-xs" onClick={handleLinkClick}>
            <Icon name="Zap" className="size-4" />
            Functions
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-1 text-xs" onClick={handleLinkClick}>
            <Icon name="Clipboard" className="size-4" />
            Instructions
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-1 text-xs" onClick={handleLinkClick}>
            <Icon name="MessageSquare" className="size-4" />
            Prompts
          </Button>
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
          Popular Categories
        </h4>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {marketplaceCategories.slice(0, 6).map((category) => (
            <Button
              key={category}
              variant="ghost"
              className="w-full justify-start h-9 text-sm"
              onClick={handleLinkClick}
            >
              <Icon name="Tag" className="size-3 mr-2" />
              {category}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* My Marketplace */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
          My Marketplace
        </h4>
        <Button variant="ghost" className="w-full justify-start h-10" onClick={handleLinkClick}>
          <Icon name="Heart" className="size-4 mr-3" />
          Wishlist
          <Badge variant="secondary" className="ml-auto text-xs">0</Badge>
        </Button>
        <Button variant="ghost" className="w-full justify-start h-10" onClick={handleLinkClick}>
          <Icon name="ShoppingCart" className="size-4 mr-3" />
          Cart
          <Badge variant="secondary" className="ml-auto text-xs">1</Badge>
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