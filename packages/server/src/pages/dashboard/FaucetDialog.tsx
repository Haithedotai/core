import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/lib/components/ui/dialog";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent } from "@/src/lib/components/ui/card";
import Icon from "@/src/lib/components/custom/Icon";
import { Image } from "@/src/lib/components/custom/Image";
import { cn } from "@/src/lib/utils";
import { getSpecificRelativeTime } from "@/src/lib/utils/date";
import moment from "moment";
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

// Utility functions
const useFaucetCooldown = (faucetInfo: any) => {
  const [remainingCooldown, setRemainingCooldown] = useState(0);

  const canRequestTokens = () => {
    if (!faucetInfo.data) return true;
    if (!faucetInfo.data.last_request) return true;
    if (!faucetInfo.data.last_request.requested_at || faucetInfo.data.last_request.requested_at === '') {
      return true;
    }

    const lastRequestMoment = moment.utc(faucetInfo.data.last_request.requested_at);
    if (!lastRequestMoment.isValid()) return true;

    const currentMoment = moment();
    const timeElapsed = currentMoment.diff(lastRequestMoment, 'milliseconds');
    const sixtyMinutesInMs = 60 * 60 * 1000;
    
    return timeElapsed >= sixtyMinutesInMs;
  };

  const getRemainingCooldownTime = () => {
    if (!faucetInfo.data?.last_request?.requested_at) return 0;
    
    const lastRequestMoment = moment.utc(faucetInfo.data.last_request.requested_at);
    if (!lastRequestMoment.isValid()) return 0;
    
    const currentMoment = moment();
    const timeElapsed = currentMoment.diff(lastRequestMoment, 'milliseconds');
    const sixtyMinutesInMs = 60 * 60 * 1000;
    
    const remaining = sixtyMinutesInMs - timeElapsed;
    return Math.max(0, remaining);
  };

  const formatRemainingTime = (ms: number) => {
    if (ms <= 0) return '';
    
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  useEffect(() => {
    const updateCooldown = () => {
      const remaining = getRemainingCooldownTime();
      setRemainingCooldown(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [faucetInfo.data]);

  return { canRequestTokens, remainingCooldown, formatRemainingTime };
};

// Faucet Selection Card Component
const FaucetSelectionCard = ({ faucet, onSelect }: { faucet: FaucetOption; onSelect: (faucet: FaucetOption) => void }) => (
  <Card 
    className="cursor-pointer hover:shadow-md transition-all duration-100 hover:bg-accent/50"
    onClick={() => onSelect(faucet)}
  >
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center border", faucet.color)}>
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
);

// Faucet Status Component
const FaucetStatus = ({ faucetInfo, canRequestTokens, remainingCooldown, formatRemainingTime }: any) => {
  if (faucetInfo.isLoading) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex items-center gap-2 text-sm">
          <Icon name="LoaderCircle" className="size-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading faucet status...</span>
        </div>
      </div>
    );
  }

  if (faucetInfo.error) {
    return (
      <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 text-sm">
          <Icon name="X" className="size-4 text-red-500" />
          <span className="text-red-700 dark:text-red-300">Failed to load faucet status</span>
        </div>
      </div>
    );
  }

  if (!faucetInfo.data) return null;

  return (
    <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
      {faucetInfo.data.last_request ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {canRequestTokens() ? (
              <>
                <Icon name="CircleCheck" className="size-4 text-green-500" />
                <span className="text-green-700 dark:text-green-300">Ready to request</span>
              </>
            ) : (
              <>
                <Icon name="Clock" className="size-4 text-orange-500" />
                <span className="text-orange-700 dark:text-orange-300">
                  Cooldown active ({formatRemainingTime(remainingCooldown)} remaining)
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            Last request: {getSpecificRelativeTime(faucetInfo.data.last_request.requested_at)}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <Icon name="CircleCheck" className="size-4 text-green-500" />
          <span className="text-green-700 dark:text-green-300">Ready to request</span>
        </div>
      )}
    </div>
  );
};

// Faucet Action Button Component
const FaucetActionButton = ({ 
  faucet, 
  canRequestTokens, 
  remainingCooldown, 
  formatRemainingTime, 
  onRequestTokens, 
  isPending 
}: any) => {
  if (faucet.id === "usdt") {
    return (
      <Button 
        variant="default" 
        size="sm" 
        className="w-full"
        onClick={onRequestTokens}
        disabled={isPending || !canRequestTokens()}
      >
        {isPending ? (
          <>
            <Icon name="LoaderCircle" className="size-4 mr-2 animate-spin" />
            Requesting Tokens...
          </>
        ) : !canRequestTokens() ? (
          <>
            <Icon name="Clock" className="size-4 mr-2" />
            Cooldown: {formatRemainingTime(remainingCooldown)}
          </>
        ) : (
          <>
            <Icon name="Droplets" className="size-4 mr-2" />
            Request USDT Tokens
          </>
        )}
      </Button>
    );
  }

  if (faucet.id === "metis") {
    return (
      <Button 
        variant="default" 
        size="sm" 
        className="w-full"
        onClick={() => window.open(faucet.address, '_blank')}
      >
        <Icon name="MessageCircle" className="size-4 mr-2" />
        Open Telegram Bot
      </Button>
    );
  }

  return null;
};

// Faucet Details View Component
const FaucetDetailsView = ({ 
  faucet, 
  onBack, 
  faucetInfo, 
  canRequestTokens, 
  remainingCooldown, 
  formatRemainingTime, 
  onRequestTokens, 
  isPending 
}: any) => (
  <div className="space-y-6">
    <Button variant="ghost" onClick={onBack} className="justify-start h-auto">
      <Icon name="ArrowLeft" className="size-4" />
      Back to faucets
    </Button>

    <div className="flex items-center p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-border/50">
      <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center border", faucet.color)}>
        <Image src={faucet.icon} alt={faucet.symbol} className="size-8" />
      </div>
      <div className="flex-1 ml-4">
        <h3 className="text-xl font-semibold text-foreground">{faucet.name}</h3>
        <p className="text-sm text-muted-foreground">{faucet.description}</p>
      </div>
    </div>

    {faucet.id === "metis" && (
      <div className="space-y-3">
        <div className="text-sm font-medium text-foreground">Telegram Bot:</div>
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
          <code className="text-sm font-mono text-foreground flex-1 break-all">
            {faucet.address}
          </code>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(faucet.address, '_blank')}
            className="size-8"
          >
            <Icon name="ExternalLink" className="size-4" />
          </Button>
        </div>
      </div>
    )}

    {faucet.id === "usdt" && (
      <div className="space-y-3">
        <div className="text-sm font-medium text-foreground">Faucet Status:</div>
        <FaucetStatus 
          faucetInfo={faucetInfo}
          canRequestTokens={canRequestTokens}
          remainingCooldown={remainingCooldown}
          formatRemainingTime={formatRemainingTime}
        />
      </div>
    )}

    <div className="space-y-3">
      <FaucetActionButton 
        faucet={faucet}
        canRequestTokens={canRequestTokens}
        remainingCooldown={remainingCooldown}
        formatRemainingTime={formatRemainingTime}
        onRequestTokens={onRequestTokens}
        isPending={isPending}
      />
    </div>
  </div>
);

// Main FaucetDialog Component
export default function FaucetDialog() {
  const [selectedFaucet, setSelectedFaucet] = useState<FaucetOption | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { getFaucetInfo, requestFaucetTokens } = useHaitheApi();
  const faucetInfo = getFaucetInfo();
  const { canRequestTokens, remainingCooldown, formatRemainingTime } = useFaucetCooldown(faucetInfo);

  const handleFaucetSelect = (faucet: FaucetOption) => setSelectedFaucet(faucet);
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedFaucet(null);
  };
  const handleRequestTokens = () => requestFaucetTokens.mutate(undefined);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="py-2 px-4 rounded-md">
          <div className="flex items-center">
            <Icon name="Droplets" className="size-4" />
            <div className="hidden sm:block ml-2">Faucet</div>
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
            <div className="space-y-4">
              <div className="text-sm font-medium text-foreground">Select a faucet:</div>
              <div className="grid gap-3">
                {faucetOptions.map((faucet) => (
                  <FaucetSelectionCard 
                    key={faucet.id} 
                    faucet={faucet} 
                    onSelect={handleFaucetSelect} 
                  />
                ))}
              </div>
            </div>
          ) : (
            <FaucetDetailsView 
              faucet={selectedFaucet}
              onBack={() => setSelectedFaucet(null)}
              faucetInfo={faucetInfo}
              canRequestTokens={canRequestTokens}
              remainingCooldown={remainingCooldown}
              formatRemainingTime={formatRemainingTime}
              onRequestTokens={handleRequestTokens}
              isPending={requestFaucetTokens.isPending}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}