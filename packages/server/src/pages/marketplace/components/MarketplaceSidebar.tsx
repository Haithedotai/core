import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "../../../lib/components/ui/button";
import { Separator } from "../../../lib/components/ui/separator";
import { Badge } from "../../../lib/components/ui/badge";
import {
  Sparkles,
  Crown,
  Zap,
  Clock,
  Tag,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { categories } from "../mockData";
import Icon from "@/src/lib/components/custom/Icon";

export default function MarketplaceSidebar() {
  const { pathname } = useLocation();
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
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

        {/* AI Asset Types */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
            Asset Types
          </p>
          <Button variant="ghost" className="w-full justify-start h-10">
            <Icon name="Brain" className="size-4 mr-3" />
            Knowledge Bases
          </Button>
          <Button variant="ghost" className="w-full justify-start h-10">
            <Icon name="Zap" className="size-4 mr-3" />
            Lambda Functions
          </Button>
          <Button variant="ghost" className="w-full justify-start h-10">
            <Icon name="Clipboard" className="size-4 mr-3" />
            Instruction Sets
          </Button>
          <Button variant="ghost" className="w-full justify-start h-10">
            <Icon name="MessageSquare" className="size-4 mr-3" />
            Prompt Sets
          </Button>
        </div>

        <Separator />

        {/* My Marketplace */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1">
            My Account
          </p>
          <Button variant="ghost" className="w-full justify-start h-10">
            <Heart className="size-4 mr-3" />
            Wishlist
            <Badge variant="secondary" className="ml-auto text-xs">3</Badge>
          </Button>
          <Button variant="ghost" className="w-full justify-start h-10">
            <ShoppingCart className="size-4 mr-3" />
            Cart
            <Badge variant="secondary" className="ml-auto text-xs">12</Badge>
          </Button>
        </div>
      </div>
    </div>
  );
} 