import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { usePrivy } from "@privy-io/react-auth";
import { useAppStore } from "../../stores/useAppStore";
import Icon from "../custom/Icon";

export default function Sidebar() {
    const { pathname } = useLocation();
    const { authenticated } = usePrivy();
    const { currentUser, currentOrganization } = useAppStore();
    
    const isActive = (path: string) => pathname === path || pathname.startsWith(path);

    if (!authenticated || !currentUser?.onboarded) {
        return (
            <div className="fixed top-[var(--navbar-height)] h-[calc(100dvh-var(--navbar-height))] w-[var(--sidebar-width)] left-0 z-40 border-r bg-background hidden lg:flex">
                <div className="flex flex-col w-full gap-3 px-4 py-6">
                    <Button variant={isActive("/") && pathname === "/" ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/">
                            <Icon name="House" className="size-5 mr-3" />
                            Home
                        </Link>
                    </Button>
                    <Button variant={isActive("/marketplace") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/marketplace">
                            <Icon name="Store" className="size-5 mr-3" />
                            Marketplace
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-[var(--navbar-height)] h-[calc(100dvh-var(--navbar-height))] w-[var(--sidebar-width)] left-0 z-40 border-r bg-background hidden lg:flex overflow-y-auto ">
            <div className="flex flex-col w-full px-4 py-6">
                {/* Main Navigation */}
                <div className="space-y-2">
                    <Button variant={isActive("/") && pathname === "/" ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/">
                            <Icon name="House" className="size-5 mr-3" />
                            Home
                        </Link>
                    </Button>
                    <Button variant={isActive("/marketplace") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/marketplace">
                            <Icon name="Store" className="size-5 mr-3" />
                            Marketplace
                        </Link>
                    </Button>
                    <Button variant={isActive("/dashboard") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/dashboard">
                            <Icon name="LayoutDashboard" className="size-5 mr-3" />
                            Dashboard
                        </Link>
                    </Button>
                </div>

                <Separator className="my-6" />

                {/* Tools & Features */}
                <div className="space-y-2">
                    <div className="px-4 py-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-relaxed">Tools</p>
                    </div>
                    <Button variant={isActive("/projects") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/projects">
                            <Icon name="FolderOpen" className="size-5 mr-3" />
                            Projects
                        </Link>
                    </Button>
                    <Button variant={isActive("/create") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/create">
                            <Icon name="Plus" className="size-5 mr-3" />
                            Create Item
                        </Link>
                    </Button>
                    <Button variant={isActive("/analytics") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/analytics">
                            <Icon name="TrendingUp" className="size-5 mr-3" />
                            Analytics
                        </Link>
                    </Button>
                    <Button variant={isActive("/purchases") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/purchases">
                            <Icon name="ShoppingBag" className="size-5 mr-3" />
                            Purchases
                        </Link>
                    </Button>
                </div>

                <Separator className="my-6" />

                {/* Organization & Settings */}
                <div className="space-y-2">
                    <div className="px-4 py-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-relaxed">Organization</p>
                    </div>
                    {currentOrganization && (
                        <Button variant={isActive("/organization") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                            <Link to="/organization">
                                <Icon name="Building" className="size-5 mr-3" />
                                <span className="truncate">{currentOrganization.name}</span>
                            </Link>
                        </Button>
                    )}
                    <Button variant={isActive("/organization") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/organization">
                            <Icon name="Users" className="size-5 mr-3" />
                            Members
                        </Link>
                    </Button>
                </div>

                <Separator className="my-6" />

                {/* User Navigation */}
                <div className="space-y-2">
                    <div className="px-4 py-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-relaxed">Account</p>
                    </div>
                    <Button variant={isActive("/profile") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/profile">
                            <Icon name="User" className="size-5 mr-3" />
                            Profile
                        </Link>
                    </Button>
                    <Button variant={isActive("/settings") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/settings">
                            <Icon name="Settings" className="size-5 mr-3" />
                            Settings
                        </Link>
                    </Button>
                    <Button variant={isActive("/help") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/help">
                            <Icon name="CircleHelp" className="size-5 mr-3" />
                            Help & Support
                        </Link>
                    </Button>
                </div>

                {/* User info at bottom */}
                {currentUser && (
                    <div className="mt-auto px-4 py-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
                            <Icon name="User" className="size-5 text-muted-foreground" />
                            <div className="flex flex-col min-w-0 flex-1 space-y-1">
                                <p className="text-sm font-medium truncate leading-relaxed">
                                    {currentUser.name || 'User'}
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {currentOrganization?.name || 'No organization'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}