import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { usePrivy } from "@privy-io/react-auth";
import { useHaitheApi } from "../../hooks/use-haithe-api";
import Icon from "../custom/Icon";

export default function Sidebar() {
    const { pathname } = useLocation();
    const { authenticated } = usePrivy();
    const api = useHaitheApi();
    
    const isActive = (path: string) => pathname === path || pathname.startsWith(path);

    // Check if user is fully authenticated (wallet + Haithe)
    const isHaitheLoggedIn = api.isLoggedIn();

    if (!authenticated || !isHaitheLoggedIn) {
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
                    <Button variant={isActive("/agents") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/agents">
                            <Icon name="Book" className="size-4 mr-3" />
                            Docs
                        </Link>
                    </Button>
                    <Button variant={isActive("/agents") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/agents">
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
                    <Button variant={isActive("/agents") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/agents">
                            <Icon name="Bot" className="size-4 mr-3" />
                            Agents
                        </Link>
                    </Button>
                    <Button variant={isActive("/workflows") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/workflows">
                            <Icon name="GitBranch" className="size-4 mr-3" />
                            Workflows
                        </Link>
                    </Button>
                    <Button variant={isActive("/analytics") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/analytics">
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
                    <Button variant={isActive("/") && pathname === "/" ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/">
                            <Icon name="Store" className="size-4 mr-3" />
                            Browse
                        </Link>
                    </Button>
                    <Button variant={isActive("/purchases") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/purchases">
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
                    <Button variant={isActive("/profile") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/profile">
                            <Icon name="User" className="size-4 mr-3" />
                            Profile
                        </Link>
                    </Button>
                    <Button variant={isActive("/organization") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/organization">
                            <Icon name="Building" className="size-4 mr-3" />
                            Organization
                        </Link>
                    </Button>
                    <Button variant={isActive("/settings") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/settings">
                            <Icon name="Settings" className="size-4 mr-3" />
                            Settings
                        </Link>
                    </Button>
                </div>

                <Separator className="my-2" />

                {/* Other Links */}
                <div className="space-y-1">
                    <Button variant={isActive("/help") ? "outline" : "ghost"} className="w-full justify-start h-10" asChild>
                        <Link to="/help">
                            <Icon name="CircleHelp" className="size-4 mr-3" />
                            Help & Support
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}