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
          <Icon name="Zap" className="size-8 text-orange-400" />
          <span className="text-2xl font-semibold bg-gradient-to-r from-orange-400 via-red-500 to-sky-400 bg-clip-text text-transparent">Haithe</span>
        </Link>
      </div>

      {/* Right side - User info and actions */}
      <div className="flex gap-3 items-center">
        {/* Organization selector */}
        {authenticated && currentUser && currentOrganization && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-md gap-2">
                <Icon name="Building" className="size-4" />
                <p className="hidden sm:inline">
                  {currentOrganization.name}
                </p>
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
        {!authenticated || !currentUser?.onboarded && <CreatorSheet />}

        {/* Connect wallet / User menu */}
        <Connect />
      </div>
    </nav>
  );
}