import { Link } from "@tanstack/react-router";
import Connect from "../../../lib/components/app/Connect";
import MarketplaceMobileSidebar from "./MarketplaceMobileSidebar";
import CreatorSheet from '@/src/lib/components/app/CreatorSheet';
import OrganizationSelector from "../../dashboard/OrganizationSelector";

export default function MarketplaceNavbar() {
  return (
    <nav className="bg-background border-b flex items-center justify-between h-20 px-4 @container bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      {/* Left side - Mobile menu + Logo */}
      <div className="flex items-center gap-4">
        <MarketplaceMobileSidebar />
        <Link to="/marketplace" className="flex gap-2 items-center">
          <img
            src="/static/haitheLogo.webp"
            alt="Logo"
            className="h-9 w-9 overflow-hidden rounded-full object-cover"
          />
          <div className="hidden sm:block">
            <span className="text-2xl">Haithe</span>
            <span className="text-sm text-muted-foreground ml-2">Marketplace</span>
          </div>
          <div className="@md:hidden">
            <span className="text-lg font-bold">Marketplace</span>
          </div>
        </Link>
      </div>

      {/* Right side - Actions and user */}
      <div className="flex items-center gap-3">
        <OrganizationSelector />
        <CreatorSheet />
        <Connect />
      </div>
    </nav>
  );
} 