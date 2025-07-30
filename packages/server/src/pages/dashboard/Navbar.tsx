import { Link } from "@tanstack/react-router";
import Connect from "@/src/lib/components/app/Connect";
import OrganizationSelector from "./OrganizationSelector";
import MobileNav from "./SidebarMobile";

export default function Navbar() {
  return (
    <nav className="fixed bg-background top-0 gap-2 h-[var(--navbar-height)] w-full z-50 border-b flex items-center justify-between px-8 lg:px-4 ">
      {/* Left side - Logo and main navigation */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <MobileNav />
          <Link to="/dashboard" className="flex gap-2 items-center">
            <img
              src="/static/haitheLogo.webp"
              alt="Logo"
              className="h-9 w-9 overflow-hidden rounded-full 
            object-cover"
            />
            <span className="text-2xl hidden sm:block">Haithe</span>
          </Link>
        </div>
      </div>


      {/* Right side - User info and actions */}
      <div className="flex items-center gap-4">
        <OrganizationSelector />
        <Connect />
      </div>
    </nav>
  );
}
