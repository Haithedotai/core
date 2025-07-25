import { Search, ShoppingCart } from 'lucide-react';
import { Link } from "@tanstack/react-router";
import { Button } from "../../../lib/components/ui/button";
import { Input } from "../../../lib/components/ui/input";
import Connect from "../../../lib/components/app/Connect";
import OrganizationSelector from "../../dashboard/OrganizationSelector";
import MarketplaceMobileSidebar from "./MarketplaceMobileSidebar";
import CreatorSheet from '@/src/lib/components/app/CreatorSheet';

interface MarketplaceNavbarProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export default function MarketplaceNavbar({ onSearch, searchQuery }: MarketplaceNavbarProps) {
  return (
    <nav className="bg-background border-b flex items-center justify-between h-20 px-4 @container">
      {/* Left side - Mobile menu + Logo */}
      <div className="flex items-center gap-4">
        <MarketplaceMobileSidebar />
        <Link to="/dashboard" className="flex gap-2 items-center">
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
      <div className="flex items-center gap-3 md:gap-4">
        <CreatorSheet />
        <Connect />
      </div>
    </nav>
  );
} 