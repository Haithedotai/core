import { usePrivy } from "@privy-io/react-auth";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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
import { useAppStore } from "../../stores/useAppStore";
import { useEffect } from "react";

export default function Connect() {
    const { ready, authenticated, user, login, logout } = usePrivy();
    const {
        currentUser,
        currentOrganization,
        setCurrentUser,
        setCurrentOrganization,
        setAuthenticated,
        users,
        organizations
    } = useAppStore();

    // Sync authentication state with store
    useEffect(() => {
        setAuthenticated(authenticated);

        if (authenticated && user?.wallet?.address && !currentUser) {
            // Find user by wallet address
            const foundUser = users.find(u => u.wallet_address === user.wallet?.address);
            if (foundUser) {
                setCurrentUser(foundUser);

                // Set default organization
                const userOrgs = organizations.filter(org => org.owner_id === foundUser.id);
                if (userOrgs.length > 0 && !currentOrganization) {
                    setCurrentOrganization(userOrgs[0]);
                }
            }
        } else if (!authenticated) {
            setCurrentUser(null);
            setCurrentOrganization(null);
        }
    }, [authenticated, user, currentUser, setCurrentUser, setCurrentOrganization, setAuthenticated, users, organizations, currentOrganization]);

    const handleLogout = () => {
        logout();
        setCurrentUser(null);
        setCurrentOrganization(null);
        setAuthenticated(false);
    };

    const getUserInitials = (name: string | null, walletAddress: string) => {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return walletAddress.slice(2, 4).toUpperCase();
    };

    if (!ready) return (
        <Button disabled variant="outline" className="rounded-md">
            <Skeleton className="w-24 h-4 bg-muted" />
        </Button>
    );

    if (!authenticated) return (
        <Button
            onClick={() => login()}
            variant="outline"
            className="py-2 px-4 rounded-md"
        >
            <Icon name="Wallet" className="size-4 mr-2" />
            Connect Wallet
        </Button>
    );

    const walletAddress = user?.wallet?.address || '';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="relative">
                    <Icon name="Wallet" className="size-4 mr-1" />
                    <p className="hidden sm:inline">
                        {truncateAddress(walletAddress)}
                    </p>
                    {currentUser?.verification_status === 'verified' && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background">
                            <Icon name="Check" className="size-2 text-white" />
                        </div>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-72 mt-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex justify-between py-1">
                        <div className="flex items-center">
                            <div className="flex flex-col min-w-0 flex-1">
                                <p className="text-sm font-medium leading-none truncate">
                                    {currentUser?.name || 'Anonymous User'}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground mt-1">
                                    {truncateAddress(walletAddress)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {currentUser?.verification_status !== 'verified' && (
                                <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <Icon name="ShieldCheck" className="size-3 mr-1" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                        <Icon name="LayoutDashboard" className="size-4 mr-2" />
                        Dashboard
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link to="/projects">
                        <Icon name="FolderOpen" className="size-4 mr-2" />
                        Projects
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link to="/purchases">
                        <Icon name="ShoppingBag" className="size-4 mr-2" />
                        Purchases
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link to="/profile">
                        <Icon name="User" className="size-4 mr-2" />
                        Profile
                    </Link>
                </DropdownMenuItem>


                <DropdownMenuItem asChild>
                    <Link to="/organization">
                        <Icon name="Building" className="size-4 mr-2" />
                        Organization
                    </Link>
                </DropdownMenuItem>


                <DropdownMenuItem asChild>
                    <Link to="/analytics">
                        <Icon name="TrendingUp" className="size-4 mr-2" />
                        Analytics
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link to="/settings">
                        <Icon name="Settings" className="size-4 mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link to="/help">
                        <Icon name="CircleHelp" className="size-4 mr-2" />
                        Help & Support
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 focus:text-red-400"
                >
                    <Icon name="LogOut" className="size-4 mr-2" />
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}