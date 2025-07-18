import { useState } from "react";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../ui/sheet";
import Icon from "../custom/Icon";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "@tanstack/react-router";

export default function CreatorSheet() {
  const [open, setOpen] = useState(false);
  const { authenticated, login } = usePrivy();
  const navigate = useNavigate();

  const handleStartCreating = () => {
    if (!authenticated) {
      // Close sheet and prompt to connect wallet
      setOpen(false);
      login();
      return;
    }
    
    // User is authenticated, navigate to onboarding
    setOpen(false);
    navigate({ to: "/onboarding" });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-sm">
          <Icon name="Zap" className="h-4 w-4 text-orange-400" />
          <span className="bg-gradient-to-r from-orange-400 via-red-500 to-sky-400 bg-clip-text text-transparent font-semibold">
            Get Started
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="px-0 w-full sm:w-[480px]">
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="bg-card border-b px-6 py-8">
            <SheetHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div>
                  <SheetTitle className="text-2xl font-bold">
                    <span className="bg-gradient-to-r from-orange-400 via-red-500 to-sky-400 bg-clip-text text-transparent font-semibold">
                      Become a creator
                    </span>
                  </SheetTitle>
                  <SheetDescription className="text-base text-muted-foreground">
                    Build, share, and monetize AI models with context.
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-6 space-y-8">
            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border rounded-xl p-4 hover:bg-accent/50 transition-colors">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon name="Cpu" className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Custom Models</h4>
                    <p className="text-xs text-muted-foreground">Build & train</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-xl p-4 hover:bg-accent/50 transition-colors">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon name="DollarSign" className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Earn Revenue</h4>
                    <p className="text-xs text-muted-foreground">Marketplace sales</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-xl p-4 hover:bg-accent/50 transition-colors">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon name="Wrench" className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Pro Tools</h4>
                    <p className="text-xs text-muted-foreground">Advanced features</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-xl p-4 hover:bg-accent/50 transition-colors">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon name="Headphones" className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Priority Support</h4>
                    <p className="text-xs text-muted-foreground">Expert help</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-muted/50 rounded-xl p-6 text-center border">
              <div className="flex justify-center items-center gap-8">
                <div>
                  <div className="text-2xl font-bold text-foreground">1,200+</div>
                  <div className="text-sm text-muted-foreground">Creators</div>
                </div>
                <div className="h-8 w-px bg-border"></div>
                <div>
                  <div className="text-2xl font-bold text-foreground">15K+</div>
                  <div className="text-sm text-muted-foreground">Models</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="border-t px-6 py-6 bg-card/50">
            <Button
              className="w-full h-12 text-base font-semibold"
              onClick={handleStartCreating}
            >
              Start Creating
              <Icon name="ArrowRight" className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Free to join • No setup fees
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 