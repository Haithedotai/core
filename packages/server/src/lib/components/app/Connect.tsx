import { usePrivy } from "@privy-io/react-auth";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { truncateAddress } from "../../utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import Icon from "../custom/Icon";
import { Link } from "@tanstack/react-router";

export default function Connect() {
    const { ready, authenticated, user, login, logout } = usePrivy();

    if (!ready) return (
        <Button disabled variant="outline" className="rounded-sm">
            <Skeleton className="w-24 h-2 bg-muted" />
        </Button>
    );

    if (!authenticated) return (
        <Button
            onClick={() => login()}
            variant="outline"
            className="py-1 px-5 rounded-sm"
        >
            Connect Wallet
        </Button>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Avatar className="size-6">
                        <AvatarImage src={localStorage.getItem(`profile_image_${user?.id}`) || undefined} className="object-cover" />
                        <AvatarFallback className="text-xs font-black bg-primary text-primary-foreground border border-border">
                            {user?.wallet?.address?.slice(0, 1)?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-foreground text-xs">{truncateAddress(user?.wallet?.address ?? "")}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link to="/">
                        <Icon name="User" className="mr-2 w-4 h-4" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                    logout();
                }} className="font-bold text-muted-foreground">
                    <Icon name="LogOut" className="mr-2 w-4 h-4" />
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}