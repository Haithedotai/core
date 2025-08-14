import { useState, useEffect } from "react";
import { Button } from "@/src/lib/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/lib/components/ui/dialog";
import { Input } from "@/src/lib/components/ui/input";
import Icon from "@/src/lib/components/custom/Icon";
import { useHaitheApi } from "@/src/lib/hooks/use-haithe-api";
import { copyToClipboard } from "@/utils";
import QRCode from "qrcode";
import type { Organization } from "services";
import { Image } from "@/src/lib/components/custom/Image";

export default function FundOrgDialog({ organization, refetchBalance }: { organization: Organization, refetchBalance: () => void }) {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [amount, setAmount] = useState<string>("1");
    const haithe = useHaitheApi();
    const { mutateAsync: transferUSDT } = haithe.transferUSDT;

    const handleFundWithConnectedWallet = async () => {
        try {
            const decimals = 18;
            const amountInWei = BigInt(Math.floor(Number(amount) * 10 ** decimals));
            await transferUSDT({
                recipient: organization.address,
                amount: amountInWei,
            });
            refetchBalance();
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (organization?.address && isDialogOpen) {
            const paymentUri = `ethereum:${organization.address}`;
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
                    console.log('QR code generated successfully');
                    setQrCodeDataUrl(dataUrl);
                }
            });
        }
    }, [organization?.address, isDialogOpen]);

    if (!organization?.address) {
        return null;
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                    <Icon name="QrCode" className="size-4" />
                    <p className="hidden md:block">Fund Organization</p>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Image src="/static/tether.svg" alt="USDT" className="size-5" />
                            Fund Organization
                        </div>
                        <DialogClose asChild>
                            <Button variant="ghost" size="icon">
                                <Icon name="X" className="size-4" />
                            </Button>
                        </DialogClose>
                    </DialogTitle>
                    <DialogDescription className="hidden">
                        Send USDT to the organization wallet to fund it.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-2">
                    <div className="flex justify-center">
                        <div className="p-1 bg-white rounded-lg border border-border/50">
                            {qrCodeDataUrl ? (
                                <img
                                    src={qrCodeDataUrl}
                                    alt="QR Code for organization wallet"
                                    className="w-48 h-48"
                                />
                            ) : (
                                <div className="w-48 h-48 flex items-center justify-center">
                                    <Icon name="LoaderCircle" className="size-8 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Wallet Address */}
                    <div className="space-y-3">
                        <div className="text-sm font-medium text-foreground">Organization Wallet Address:</div>
                        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border/50">
                            <code className="text-sm font-mono text-foreground flex-1 break-all">
                                {organization.address}
                            </code>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(organization.address, "Organization Address")}
                                className="size-8"
                            >
                                <Icon name="Copy" className="size-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-3">
                        <div className="text-sm font-medium text-foreground">Amount to Fund (USDT):</div>
                        <Input
                            type="number"
                            min="0"
                            step="any"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="Enter amount"
                        />
                    </div>

                    <Button variant="outline" size="sm" onClick={() => handleFundWithConnectedWallet()} className="w-full">
                        <Icon name="Wallet" className="size-4" />
                        Use Connected Wallet
                    </Button>

                    {/* Instructions */}
                    <div className="space-y-3">
                        <div className="text-sm font-medium text-foreground">How to fund:</div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-medium text-primary">1</span>
                                </div>
                                <p>Open your wallet app (MetaMask, Rainbow, etc.)</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-medium text-primary">2</span>
                                </div>
                                <p>Tap the QR code scanner or copy the address above</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-medium text-primary">3</span>
                                </div>
                                <p>Send the desired amount of USDT to fund your organization</p>
                            </div>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-2">
                            <Icon name="Info" className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-amber-800 dark:text-amber-200">
                                <p>You need to fund your organization wallet to use AI agents. The funds will be used to pay for agent operations and API calls.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}