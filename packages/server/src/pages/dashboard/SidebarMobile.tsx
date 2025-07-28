import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "../../lib/components/ui/button";
import { Separator } from "../../lib/components/ui/separator";
import { usePrivy } from "@privy-io/react-auth";
import { useHaitheApi } from "../../lib/hooks/use-haithe-api";
import Icon from "../../lib/components/custom/Icon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../lib/components/ui/sheet";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const { authenticated } = usePrivy();
  const api = useHaitheApi();
  
  // Returns true if the current path matches exactly, or for subpages, if it starts with the path and the path is not '/dashboard'
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Check if user is fully authenticated (wallet + Haithe)
  const isHaitheLoggedIn = api.isLoggedIn;

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const NavigationContent = () => {
    if (!authenticated || !isHaitheLoggedIn()) {
      return (
        <div className="flex flex-col w-full gap-3 px-4 py-6">
          {/* Dashboard Links for unauthenticated users */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 py-2">
              Home
            </p>
            <Button 
              variant={isActive("/dashboard") ? "outline" : "ghost"} 
              className="w-full justify-start h-10" 
              asChild
              onClick={handleLinkClick}
            >
              <Link to="/dashboard">
                <Icon name="LayoutDashboard" className="size-4 mr-3" />
                Overview
              </Link>
            </Button>
            <Button 
              variant={isActive("/dashboard/agents") ? "outline" : "ghost"} 
              className="w-full justify-start h-10" 
              asChild
              onClick={handleLinkClick}
            >
              <Link to="/dashboard/agents">
                <Icon name="Book" className="size-4 mr-3" />
                Docs
              </Link>
            </Button>
            <Button 
              variant={isActive("/dashboard/agents") ? "outline" : "ghost"} 
              className="w-full justify-start h-10" 
              asChild
              onClick={handleLinkClick}
            >
              <Link to="/dashboard/agents">
                <Icon name="Headset" className="size-4 mr-3" />
                Help & Support
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col w-full gap-3 px-4 py-6">
        {/* Dashboard Links */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 py-2">
            Dashboard
          </p>
          <Button 
            variant={isActive("/dashboard") ? "outline" : "ghost"} 
            className="w-full justify-start h-10" 
            asChild
            onClick={handleLinkClick}
          >
            <Link to="/dashboard">
              <Icon name="LayoutDashboard" className="size-4 mr-3" />
              Overview
            </Link>
          </Button>
          <Button 
            variant={isActive("/dashboard/agents") ? "outline" : "ghost"} 
            className="w-full justify-start h-10" 
            asChild
            onClick={handleLinkClick}
          >
            <Link to="/dashboard/agents">
              <Icon name="Bot" className="size-4 mr-3" />
              Agents
            </Link>
          </Button>
          <Button 
            variant={isActive("/dashboard/workflows") ? "outline" : "ghost"} 
            className="w-full justify-start h-10" 
            asChild
            onClick={handleLinkClick}
          >
            <Link to="/dashboard/workflows">
              <Icon name="GitBranch" className="size-4 mr-3" />
              Workflows
            </Link>
          </Button>
          <Button 
            variant={isActive("/dashboard/analytics") ? "outline" : "ghost"} 
            className="w-full justify-start h-10" 
            asChild
            onClick={handleLinkClick}
          >
            <Link to="/dashboard/analytics">
              <Icon name="TrendingUp" className="size-4 mr-3" />
              Analytics
            </Link>
          </Button>
        </div>

        <Separator className="my-2" />

        {/* Marketplace Links */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 py-2">
            Marketplace
          </p>
          <Button 
            variant={isActive("/marketplace") && pathname === "/marketplace" ? "outline" : "ghost"} 
            className="w-full justify-start h-10" 
            asChild
            onClick={handleLinkClick}
          >
            <Link to="/marketplace">
              <Icon name="Store" className="size-4 mr-3" />
              Browse Marketplace
            </Link>
          </Button>
          <Button 
            variant={isActive("/dashboard/purchases") ? "outline" : "ghost"} 
            className="w-full justify-start h-10" 
            asChild
            onClick={handleLinkClick}
          >
            <Link to="/dashboard/purchases">
              <Icon name="ShoppingBag" className="size-4 mr-3" />
              Purchases
            </Link>
          </Button>
        </div>

        <Separator className="my-2" />

        {/* Account Links */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 py-2">
            Account
          </p>
          <Button 
            variant={isActive("/dashboard/profile") ? "outline" : "ghost"} 
            className="w-full justify-start h-10" 
            asChild
            onClick={handleLinkClick}
          >
            <Link to="/dashboard/profile">
              <Icon name="User" className="size-4 mr-3" />
              Profile
            </Link>
          </Button>
          <Button 
            variant={isActive("/dashboard/settings") ? "outline" : "ghost"} 
            className="w-full justify-start h-10" 
            asChild
            onClick={handleLinkClick}
          >
            <Link to="/dashboard/settings">
              <Icon name="Building" className="size-4 mr-3" />
              Settings
            </Link>
          </Button>
        </div>

        <Separator className="my-2" />

        {/* Other Links */}
        <div className="space-y-1">
          <Button 
            variant={isActive("/dashboard/help") ? "outline" : "ghost"} 
            className="w-full justify-start h-10" 
            asChild
            onClick={handleLinkClick}
          >
            <Link to="/dashboard/help">
              <Icon name="CircleHelp" className="size-4 mr-3" />
              Help & Support
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
        >
          <Icon name="Menu" className="size-5" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <img
              src="/static/haitheLogo.webp"
              alt="Logo"
              className="h-8 w-8 overflow-hidden rounded-full object-cover"
            />
            <span className="text-xl">Haithe</span>
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto">
          <NavigationContent />
        </div>
      </SheetContent>
    </Sheet>
  );
} 