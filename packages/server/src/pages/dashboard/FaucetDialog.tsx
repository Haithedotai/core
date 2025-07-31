import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/lib/components/ui/dialog";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import Icon from "@/src/lib/components/custom/Icon";
import { Image } from "@/src/lib/components/custom/Image";
import { copyToClipboard } from "@/utils";
import QRCode from "qrcode";
import { cn } from "@/src/lib/utils";

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
    address: "0x1234567890123456789012345678901234567890", // Replace with actual faucet address
    description: "Get test USDT tokens for development and testing",
    network: "Metis Andromeda",
    color: "from-green-500/10 to-green-600/10"
  },
  {
    id: "metis",
    name: "METIS Faucet",
    symbol: "METIS",
    icon: "/static/metis.svg", // You'll need to add this icon
    address: "0x0987654321098765432109876543210987654321", // Replace with actual faucet address
    description: "Get test METIS tokens for gas fees and testing",
    network: "Metis Andromeda",
    color: "from-blue-500/10 to-blue-600/10"
  }
];

export default function FaucetDialog() {
  const [selectedFaucet, setSelectedFaucet] = useState<FaucetOption | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    if (selectedFaucet?.address && isDialogOpen) {
      const paymentUri = `ethereum:${selectedFaucet.address}`;
      QRCode.toDataURL(paymentUri, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error, dataUrl) => {
        if (error) {
          console.error('Error generating QR code:', error);
        } else {
          setQrCodeDataUrl(dataUrl);
        }
      });
    }
  }, [selectedFaucet?.address, isDialogOpen]);

  const handleFaucetSelect = (faucet: FaucetOption) => {
    setSelectedFaucet(faucet);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedFaucet(null);
    setQrCodeDataUrl("");
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
                size="sm" 
                onClick={() => setSelectedFaucet(null)}
                className="justify-start p-0 h-auto"
              >
                <Icon name="ArrowLeft" className="size-4 mr-2" />
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

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-1 bg-white rounded-lg border border-border/50">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt={`QR Code for ${selectedFaucet.name}`}
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center">
                      <Icon name="LoaderCircle" className="size-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Faucet Address */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground">Faucet Address:</div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <code className="text-sm font-mono text-foreground flex-1 break-all">
                    {selectedFaucet.address}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(selectedFaucet.address, `${selectedFaucet.name} Address`)}
                    className="size-8"
                  >
                    <Icon name="Copy" className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full">
                  <Icon name="ExternalLink" className="size-4 mr-2" />
                  Open in Wallet
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Icon name="Globe" className="size-4 mr-2" />
                  Visit Faucet Website
                </Button>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground">How to use the faucet:</div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">1</span>
                    </div>
                    <p>Connect your wallet to the Metis Andromeda network</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">2</span>
                    </div>
                    <p>Visit the faucet website or use the QR code above</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-primary">3</span>
                    </div>
                    <p>Request test tokens to your wallet address</p>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Icon name="Info" className="size-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p>These are testnet tokens with no real value. They are used for development and testing purposes only.</p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <Button variant="outline" size="sm" onClick={handleDialogClose} className="w-full">
                <Icon name="X" className="size-4 mr-2" />
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}