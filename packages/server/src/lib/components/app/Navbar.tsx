import Icon from "../custom/Icon";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import Connect from "./Connect";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 gap-2 h-[var(--navbar-height)] w-full z-50 border-b bg-background flex items-center justify-between px-4">
      {/* top left */}
      <div className="flex gap-2 items-center">
        <Icon name="Zap" className="size-8" />
        <span className="text-2xl font-semibold">Context</span>
      </div>

      <div className="flex gap-2 items-center">
        <Link to="/" className="text-sm font-medium">
          <Button variant={location.pathname === "/" ? "default" : "ghost"} className="rounded-sm">
            Seller
          </Button>
        </Link>

        <Link to="/" className="text-sm font-medium">
          <Button variant={location.pathname === "/" ? "default" : "ghost"} className="rounded-sm">
            Buyer
          </Button>
        </Link>

        <Connect />
      </div>
    </nav>
  )
}