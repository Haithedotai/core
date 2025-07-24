import { Link } from "@tanstack/react-router";
import Connect from "./Connect";
import CreatorSheet from "./CreatorSheet";
import OrganizationSelector from "./OrganizationSelector";
import { usePrivy } from "@privy-io/react-auth";
import { useHaitheApi } from "../../hooks/use-haithe-api";

export default function Navbar() {
  const { authenticated } = usePrivy();
  const api = useHaitheApi();
  const isHaitheLoggedIn = api.isLoggedIn();
  const { data: userOrganizations, isLoading: isUserOrganizationsLoading } = api.getUserOrganizations();

  return (
    <nav className="fixed top-0 gap-2 h-[var(--navbar-height)] w-full z-50 border-b flex items-center justify-between px-8 lg:px-4">
      {/* Left side - Logo and main navigation */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex gap-2 items-center">
          <img
            src="/static/haitheLogo.png"
            alt="Logo"
            className="h-9 w-9 overflow-hidden rounded-full 
          object-cover"
          />
          <span className="text-2xl">Haithe</span>
        </Link>
      </div>


      {/* Right side - User info and actions */}
      <div className="flex items-center gap-4">
        {/* {authenticated && isHaitheLoggedIn && (
          <CreatorSheet />
        )} */}
        
        <OrganizationSelector />
        <Connect />
      </div>
    </nav>
  );
}
