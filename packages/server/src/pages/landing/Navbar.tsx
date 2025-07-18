import { Button } from "@/src/lib/components/ui/button";
import { Link } from "@tanstack/react-router";


export function Navbar() {
  return (
    <nav className="border-b border-white/10 bg-black/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src="/static/haitheLogo.png"
            alt="Logo"
            className="h-9 w-9 overflow-hidden rounded-full object-cover"
          />
          <span className="font-bold text-2xl text-white tracking-tight">
            Haithe
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {[
            ["Problem", "#problem"],
            ["Solution", "#solution"],
            ["How It Works", "#how-it-works"],
            ["Features", "#features"],
            ["Community", "#community"],
            ["Challenges", "/challenges"],
          ].map(([label, href]) => (
            <Link
              key={label}
              to={href}
              className="text-sm font-medium text-white/60 hover:text-white transition-all duration-300 hover:scale-105 relative group"
            >
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/5 border-0 transition-all duration-300 hover:scale-105"
          >
            Sign In
          </Button>
          <Button
            size="sm"
            className="bg-white text-black hover:bg-white/90 border-0 font-semibold transition-all duration-300 hover:scale-105"
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
}