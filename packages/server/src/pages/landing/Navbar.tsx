import { Button } from "@/src/lib/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/src/lib/components/ui/sheet";
import { useState } from "react";
import Connect from "@/src/lib/components/app/Connect";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import Icon from "@/src/lib/components/custom/Icon";
import { usePrivy } from "@privy-io/react-auth";

export function Navbar() {
  const api = useHaitheApi();
  const isHaitheLoggedIn = api.isLoggedIn;
  const { ready, authenticated, user } = usePrivy();

  const navLinks = [
    ["Problem", "#problem"],
    ["Solution", "#solution"],
    ["How It Works", "#how-it-works"],
    ["Features", "#features"],
    ["Community", "#community"],
    ["Challenges", "/challenges"],
  ];
  const [open, setOpen] = useState(false);

  // Custom handler for anchor links in Sheet
  function handleSheetAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    setOpen(false);
    setTimeout(() => {
      const el = document.getElementById(href.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = href;
      }
    }, 300); // Wait for Sheet to close
  }

  return (
    <nav className="border-b min-h-20 flex w-full items-center border-white/10 bg-black/50 backdrop-blur-xl fixed top-0 z-50 glass">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img
            src="/static/haitheLogo.webp"
            alt="Logo"
            className="h-8 w-8 lg:h-9 lg:w-9 overflow-hidden rounded-full object-cover"
          />
          <span className="font-bold text-xl lg:text-2xl text-white tracking-tight">
            Haithe
          </span>
        </div>
        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center space-x-6 lg:space-x-8">
          {navLinks.map(([label, href]) => (
            href.startsWith("#") ? (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-white/60 hover:text-white transition-all duration-300 hover:scale-105 relative group"
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
            ) : (
              <Link
                key={label}
                to={href}
                className="text-sm font-medium text-white/60 hover:text-white transition-all duration-300 hover:scale-105 relative group"
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )
          ))}
        </div>
        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-3 lg:space-x-4">
          {ready && authenticated && user?.wallet?.address && isHaitheLoggedIn() &&
            <Button asChild variant="outline" size="lg" className="rounded-sm mx-4">
              <Link to="/dashboard">
                <Icon name="LayoutDashboard" className="size-4" />
                Dashboard
              </Link>
            </Button>}
          <div className="flex items-center justify-center">
            <Connect />
          </div>
        </div>
        {/* Hamburger for md and below using Sheet */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-all duration-200 focus:outline-none"
                aria-label="Open menu"
              >
                <Menu className="h-7 w-7 text-white" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black/95 p-0 w-3/4 max-w-xs flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <img
                    src="/static/haitheLogo.webp"
                    alt="Logo"
                    className="h-8 w-8 overflow-hidden rounded-full object-cover"
                  />
                  <span className="font-bold text-xl text-white tracking-tight">
                    Haithe
                  </span>
                </div>
                <SheetClose asChild>
                  <button
                    className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 focus:outline-none"
                    aria-label="Close menu"
                  >
                    <span className="sr-only">Close</span>
                  </button>
                </SheetClose>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center gap-8 py-8">
                {navLinks.map(([label, href]) => (
                  href.startsWith("#") ? (
                    <a
                      key={label}
                      href={href}
                      className="text-2xl font-semibold text-white/90 hover:text-white transition-all duration-200"
                      onClick={e => handleSheetAnchorClick(e, href)}
                    >
                      {label}
                    </a>
                  ) : (
                    <SheetClose asChild key={label}>
                      <Link
                        to={href}
                        className="text-2xl font-semibold text-white/90 hover:text-white transition-all duration-200"
                      >
                        {label}
                      </Link>
                    </SheetClose>
                  )
                ))}
                <div className="flex flex-col gap-4 w-full max-w-xs mt-8 px-4">
                  {ready && authenticated && isHaitheLoggedIn() &&
                    <Button asChild variant="outline" size="lg" className="rounded-sm">
                      <Link to="/dashboard">
                        <Icon name="LayoutDashboard" className="size-4" />
                        <p className="hidden sm:block">Dashboard</p>
                      </Link>
                    </Button>}

                    <Connect />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}