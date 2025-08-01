import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "../../lib/components/ui/button";
import { Separator } from "../../lib/components/ui/separator";
import { usePrivy } from "@privy-io/react-auth";
import { useHaitheApi } from "../../lib/hooks/use-haithe-api";
import Icon from "../../lib/components/custom/Icon";

export default function Sidebar() {
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

    if (!authenticated || !isHaitheLoggedIn()) {
        return (
            <div className="fixed top-[var(--navbar-height)] h-[calc(100dvh-var(--navbar-height))] w-[var(--sidebar-width)] left-0 z-40 border-r bg-background hidden lg:flex">
            <div className="flex flex-col w-full gap-3 px-4 py-6">
                
                {/* Dashboard Links */}
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 py-2">
                        Home
                    </p>
                    <Button variant={isActive("/dashboard") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/dashboard">
                            <Icon name="LayoutDashboard" className="size-4 mr-3" />
                            Overview
                        </Link>
                    </Button>
                    <Button variant={isActive("/dashboard/agents") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/dashboard/agents">
                            <Icon name="Book" className="size-4 mr-3" />
                            Docs
                        </Link>
                    </Button>
                    <Button variant={isActive("/dashboard/agents") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/dashboard/agents">
                            <Icon name="Headset" className="size-4 mr-3" />
                            Help & Support
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
        );
    }

    return (
        <div className="fixed top-[var(--navbar-height)] h-[calc(100dvh-var(--navbar-height))] w-[var(--sidebar-width)] left-0 z-40 border-r bg-background hidden lg:flex">
            <div className="flex flex-col w-full gap-3 px-4 py-6">
                
                {/* Dashboard Links */}
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 py-2">
                        Dashboard
                    </p>
                    <Button variant={isActive("/dashboard") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/dashboard">
                            <Icon name="LayoutDashboard" className="size-4 mr-3" />
                            Overview
                        </Link>
                    </Button>
                    <Button variant={isActive("/dashboard/agents") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/dashboard/agents">
                            <Icon name="Bot" className="size-4 mr-3" />
                            Agents
                        </Link>
                    </Button>
                    <Button variant={isActive("/dashboard/workflows") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/dashboard/workflows">
                            <Icon name="GitBranch" className="size-4 mr-3" />
                            Workflows
                        </Link>
                    </Button>
                    <Button variant={isActive("/dashboard/analytics") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/dashboard/analytics">
                            <Icon name="TrendingUp" className="size-4 mr-3" />
                            Analytics
                        </Link>
                    </Button>
                </div>

                <Separator className="my-2" />

                {/* Account Links */}
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 py-2">
                        Account
                    </p>
                    <Button variant={isActive("/dashboard/profile") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/dashboard/profile">
                            <Icon name="User" className="size-4 mr-3" />
                            Profile
                        </Link>
                    </Button>
                    <Button variant={isActive("/dashboard/settings") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/dashboard/settings">
                            <Icon name="Settings" className="size-4 mr-3" />
                            Settings
                        </Link>
                    </Button>
                </div>

                <Separator className="my-2" />

                {/* Marketplace Links */}
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 py-2">
                        Marketplace
                    </p>
                    <Button variant={isActive("/marketplace") && pathname === "/marketplace" ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/marketplace">
                            <Icon name="Store" className="size-4 mr-3" />
                            Marketplace
                        </Link>
                    </Button>
                    <Button variant={isActive("/dashboard/purchases") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/dashboard/purchases">
                            <Icon name="ShoppingBag" className="size-4 mr-3" />
                            My Products
                        </Link>
                    </Button>
                </div>

                <Separator className="my-2" />

                {/* Other Links */}
                <div className="space-y-1">
                    <Button variant={isActive("/dashboard/help") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/dashboard/help">
                            <Icon name="CircleHelp" className="size-4 mr-3" />
                            Help & Support
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}