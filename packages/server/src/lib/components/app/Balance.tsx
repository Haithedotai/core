import { useBalance } from "wagmi";
import { cn } from "../../utils";
import { Button } from "../ui/button";
import Icon from "../custom/Icon";
import { usePrivy } from "@privy-io/react-auth";

export default function Balance({ address }: { address?: `0x${string}` }) {
    const { user } = usePrivy();
    const walletAddress = user?.wallet?.address;
    const addressToUse = address ? address : walletAddress ? walletAddress : undefined;

    const balance = useBalance({
        address: addressToUse as `0x${string}`,
    })

    if (!balance.data) {
        return null;
    }

    return (
        <div className="text-sm text-muted-foreground flex justify-center items-center gap-2">
            <p>Your Balance: {balance?.data?.value ? Number(balance.data.value) * 1000 : 0} TMETIS</p>
            <Button variant="ghost" size="icon" onClick={() => balance.refetch()}>
                <Icon name="RefreshCcw" className={cn(
                    "size-4",
                    balance.isFetching ? "animate-spin" : ""
                )} />
            </Button>
        </div>
    )
}