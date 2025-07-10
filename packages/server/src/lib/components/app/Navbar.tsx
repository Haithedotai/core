import Icon from "../custom/Icon";
import { Link } from "@tanstack/react-router";
import Connect from "./Connect";
import CreatorSheet from "./CreatorSheet";

export default function Navbar() {
  return (
    <nav className="fixed top-0 gap-2 h-[var(--navbar-height)] w-full z-50 border-b bg-background flex items-center justify-between px-4">
      {/* top left */}
      <Link to="/" className="flex gap-2 items-center">
        <Icon name="Zap" className="size-8" />
        <span className="text-2xl font-semibold">Haithe</span>
      </Link>

      <div className="flex gap-2 items-center">
        <CreatorSheet />
        <Connect />
      </div>
    </nav>
  )
}