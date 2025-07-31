import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/lib/components/ui/dialog";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent } from "@/src/lib/components/ui/card";
import Icon from "@/src/lib/components/custom/Icon";
import { Image } from "@/src/lib/components/custom/Image";
import { cn } from "@/src/lib/utils";
import { getSpecificRelativeTime } from "@/src/lib/utils/date";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";

interface FaucetOption {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  address: string;
  description: string;
  network: string;
  color: string;
}

const faucetOptions: FaucetOption[] = [
  {
    id: "usdt",
    name: "USDT Faucet",
    symbol: "USDT",
    icon: "/static/tether.svg",
    address: "",
    description: "Get test USDT tokens for development and testing",
    network: "Metis Andromeda",
    color: "from-green-500/10 to-green-600/10"
  },
  {
    id: "metis",
    name: "METIS Faucet",
    symbol: "METIS",
    icon: "/static/metis.svg",
    address: "https://t.me/hyperion_testnet_bot",
    description: "Get test METIS tokens for gas fees via Telegram",
    network: "Metis Andromeda",
    color: "from-blue-500/10 to-blue-600/10"
  }
];

export default function FaucetDialog() {
  const [selectedFaucet, setSelectedFaucet] = useState<FaucetOption | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Use the faucet API methods
  const { getFaucetInfo, requestFaucetTokens } = useHaitheApi();
  const faucetInfo = getFaucetInfo();

  // Calculate if faucet is available
  const canRequestTokens = () => {
    if (!faucetInfo.data?.last_request) return true;

    const lastRequestTime = new Date(faucetInfo.data.last_request.requested_at).getTime();
    const currentTime = Date.now();
    const timeElapsed = currentTime - lastRequestTime;
    const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds
    
    return timeElapsed >= oneHourInMs;
  };

  const handleFaucetSelect = (faucet: FaucetOption) => {
    setSelectedFaucet(faucet);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedFaucet(null);
  };

  const handleRequestTokens = () => {
    requestFaucetTokens.mutate(undefined); // Request tokens without specifying product ID
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="py-2 px-4 rounded-md">
          <div className="flex items-center">
            <Icon name="Droplets" className="size-4" />
            <div className="hidden sm:block ml-2">
              Faucet
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Droplets" className="size-5 text-blue-500" />
            Testnet Faucet
          </DialogTitle>
          <DialogDescription>
            Get test tokens for development and testing on Metis Andromeda network.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {!selectedFaucet ? (
            // Faucet Selection View
            <div className="space-y-4">
              <div className="text-sm font-medium text-foreground">Select a faucet:</div>
              <div className="grid gap-3">
                {faucetOptions.map((faucet) => (
                  <Card 
                    key={faucet.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-100 hover:bg-accent/50"
                    onClick={() => handleFaucetSelect(faucet)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center border",
                          faucet.color
                        )}>
                          <Image src={faucet.icon} alt={faucet.symbol} className="size-8" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{faucet.name}</div>
                          <div className="text-sm text-muted-foreground">{faucet.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">{faucet.network}</div>
                        </div>
                        <Icon name="ChevronRight" className="size-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            // Faucet Details View
            <div className="space-y-6">
              {/* Back Button */}
              <Button 
                variant="ghost" 
                onClick={() => setSelectedFaucet(null)}
                className="justify-start h-auto"
              >
                <Icon name="ArrowLeft" className="size-4" />
                Back to faucets
              </Button>

              {/* Faucet Header */}
              <div className="flex items-center p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-border/50">
                <div className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center border",
                  selectedFaucet.color
                )}>
                  <Image src={selectedFaucet.icon} alt={selectedFaucet.symbol} className="size-8" />
                </div>
                <div className="flex-1 ml-4">
                  <h3 className="text-xl font-semibold text-foreground">
                    {selectedFaucet.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedFaucet.description}
                  </p>
                </div>
              </div>

              {/* Faucet Link (for Metis) */}
              {selectedFaucet.id === "metis" && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">Telegram Bot:</div>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <code className="text-sm font-mono text-foreground flex-1 break-all">
                      {selectedFaucet.address}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(selectedFaucet.address, '_blank')}
                      className="size-8"
                    >
                      <Icon name="ExternalLink" className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Faucet Status (USDT only) */}
              {selectedFaucet.id === "usdt" && faucetInfo.isLoading && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">Faucet Status:</div>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="LoaderCircle" className="size-4 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Loading faucet status...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedFaucet.id === "usdt" && faucetInfo.error && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">Faucet Status:</div>
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="X" className="size-4 text-red-500" />
                      <span className="text-red-700 dark:text-red-300">Failed to load faucet status</span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedFaucet.id === "usdt" && faucetInfo.data && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">Faucet Status:</div>
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    {faucetInfo.data.last_request ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="Clock" className="size-4 text-orange-500" />
                          <span className="text-orange-700 dark:text-orange-300">
                            {canRequestTokens() ? "Ready to request" : "Cooldown active"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last request: {getSpecificRelativeTime(faucetInfo.data.last_request.requested_at)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Circle" className="size-4 text-blue-500" />
                        <span className="text-blue-700 dark:text-blue-300">No tokens requested yet</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {selectedFaucet.id === "usdt" && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full"
                    onClick={handleRequestTokens}
                    disabled={requestFaucetTokens.isPending || !canRequestTokens()}
                  >
                    {requestFaucetTokens.isPending ? (
                      <>
                        <Icon name="LoaderCircle" className="size-4 mr-2 animate-spin" />
                        Requesting Tokens...
                      </>
                    ) : (
                      <>
                        <Icon name="Droplets" className="size-4 mr-2" />
                        Request USDT Tokens
                      </>
                    )}
                  </Button>
                )}
                
                {selectedFaucet.id === "metis" && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(selectedFaucet.address, '_blank')}
                  >
                    <Icon name="MessageCircle" className="size-4 mr-2" />
                    Open Telegram Bot
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}