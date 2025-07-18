import Icon from "../custom/Icon";
import { Link } from "@tanstack/react-router";
import Connect from "./Connect";
import CreatorSheet from "./CreatorSheet";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { usePrivy } from "@privy-io/react-auth";
import { useAppStore } from "../../stores/useAppStore";

export default function Navbar() {
  const { authenticated } = usePrivy();
  const { currentUser, currentOrganization } = useAppStore();

  return (
    <nav className="fixed top-0 gap-2 h-[var(--navbar-height)] w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
      {/* Left side - Logo and main navigation */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex gap-2 items-center">
          <Icon name="Zap" className="size-8 text-primary" />
          <span className="text-2xl font-semibold">Haithe</span>
        </Link>
      </div>

      {/* Right side - User info and actions */}
      <div className="flex gap-3 items-center">
        {/* Organization selector */}
        {authenticated && currentUser && currentOrganization && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-md gap-2">
                <Icon name="Building" className="size-4" />
                <span className="hidden sm:inline max-w-32 truncate">
                  {currentOrganization.name}
                </span>
                <Icon name="ChevronDown" className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Icon name="Building" className="size-4" />
                {currentOrganization.name}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Icon name="Plus" className="size-4" />
                Create Organization
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="Settings" className="size-4" />
                Manage Organizations
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Creator sheet for onboarding */}
        {!authenticated || !currentUser?.onboarded ? (
          <CreatorSheet />
        ) : (
          <Button variant="outline" className="rounded-md gap-2" asChild>
            <Link to="/create">
              <Icon name="Plus" className="size-4" />
              <span className="hidden sm:inline">Create</span>
            </Link>
          </Button>
        )}

        {/* Connect wallet / User menu */}
        <Connect />

        {/* Mobile menu */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-md">
                <Icon name="Menu" className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mt-2">
              <DropdownMenuItem asChild>
                <Link to="/marketplace">
                  <Icon name="Store" className="size-4" />
                  Marketplace
                </Link>
              </DropdownMenuItem>

              {authenticated && currentUser && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <Icon name="LayoutDashboard" className="size-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/projects">
                      <Icon name="FolderOpen" className="size-4" />
                      Projects
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/analytics">
                      <Icon name="TrendingUp" className="size-4" />
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}