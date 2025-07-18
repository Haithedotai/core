import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "../ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { useOnboardingStatus } from "../../../lib/hooks/use-organizations";

export default function Sidebar() {
    const { pathname } = useLocation();
    const { authenticated } = usePrivy();
    const { hasCompletedOnboarding, loading } = useOnboardingStatus();
    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed top-[var(--navbar-height)] h-[calc(100dvh-var(--navbar-height))] w-[var(--sidebar-width)] left-0 z-40 border-r bg-background hidden md:flex">
            <div className="flex flex-col w-full gap-2 px-4 mt-4">
                <Button variant={isActive("/") ? "outline" : "ghost"} className="w-full" asChild>
                    <Link to="/">Home</Link>
                </Button>
                
                {authenticated && hasCompletedOnboarding && !loading && (
                    <Button variant={isActive("/dashboard") ? "outline" : "ghost"} className="w-full" asChild>
                        <Link to="/dashboard">Dashboard</Link>
                    </Button>
                )}
            </div>
        </div>
    )
}