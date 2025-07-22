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
                    <Button variant={isActive("/dashboard") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                        <Link to="/dashboard">
                            <Icon name="LayoutDashboard" className="size-5 mr-3" />
                            Dashboard
                        </Link>
                    </Button>
                </div>

                <Separator className="my-6" />

                {/* AI Infrastructure - Only show if user has organization */}
                {currentOrganization && (
                    <>
                        <div className="px-4 py-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-relaxed">AI Infrastructure</p>
                        </div>
                        <div className="space-y-2">
                            <Button variant={isActive("/models") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                                <Link to="/models">
                                    <Icon name="Brain" className="size-5 mr-3" />
                                    Models
                                </Link>
                            </Button>
                            <Button variant={isActive("/agents") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                                <Link to="/agents">
                                    <Icon name="Bot" className="size-5 mr-3" />
                                    Agents
                                </Link>
                            </Button>
                            <Button variant={isActive("/workflows") ? "outline" : "ghost"} className="w-full justify-start h-12 text-base" asChild>
                                <Link to="/workflows">
                                    <Icon name="GitBranch" className="size-5 mr-3" />
                                    Workflows
                                </Link>
                            </Button>
                        </div>

                        <Separator className="my-6" />
                    </>
                )}

                {/* Tools & Features */}
                <div className="space-y-2">
                    <div className="px-4 py-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-relaxed">Tools</p>
                    </div>
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
            </div>
        </div>
    );
}