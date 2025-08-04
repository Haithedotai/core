import { usePrivy } from "@privy-io/react-auth";
import { truncateAddress } from "../../utils";
import { Button } from "../ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Separator } from "../ui/separator";
import Icon from "../custom/Icon";
import { copyToClipboard } from "../../../../utils";

export default function ProfileButton() {
    const { user, logout } = usePrivy();

    if (!user?.wallet?.address) {
        return null;
    }

    const handleValueChange = (value: string) => {
        if (value === "disconnect") {
            logout();
        }
    };

    const handleCopyAddress = () => {
        if (user?.wallet?.address) {
            copyToClipboard(user.wallet.address, "Wallet address");
        }
    };

    return (
        <Select onValueChange={handleValueChange}>
            <SelectTrigger className="w-auto rounded-md border bg-background/50 hover:bg-accent/30 hover:text-accent-foreground">
                <div className="flex items-center gap-2">
                    <Icon name="User" className="size-4" />
                    <span>{truncateAddress(user?.wallet?.address || '')}</span>
                </div>
            </SelectTrigger>
            <SelectContent align="end" className="mt-2 w-52">
                <div className="p-3 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Icon name="Wallet" className="size-4 text-muted-foreground" />
                            <span className="text-sm font-mono">{truncateAddress(user?.wallet?.address || '')}</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyAddress}
                            className="h-6 w-6 p-0"
                        >
                            <Icon name="Copy" className="size-3" />
                        </Button>
                    </div>
                </div>
                
                <SelectItem value="disconnect">
                    <div className="flex items-center gap-2 text-red-600">
                        <Icon name="LogOut" className="size-4" />
                        Disconnect
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}