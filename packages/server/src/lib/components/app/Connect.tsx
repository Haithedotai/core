import { usePrivy } from "@privy-io/react-auth";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useHaitheApi } from "../../hooks/use-haithe-api";
import Icon from "../custom/Icon";
import { useNavigate } from "@tanstack/react-router";

export default function Connect() {
    const { ready, authenticated, user, login: privyLogin, logout: privyLogout } = usePrivy();
    const api = useHaitheApi();
    const navigate = useNavigate();
    const { data: userOrganizations, isLoading: isUserOrganizationsLoading } = api.getUserOrganizations();

    // Get authentication state
    const isWalletConnected = ready && authenticated && user?.wallet?.address;
    const isHaitheLoggedIn = api.isLoggedIn();

    // Get profile data when logged in
    const profileQuery = api.profile();

    // Mutations
    const loginMutation = api.login;
    const logoutMutation = api.logout;

    const handleWalletConnect = async () => {
        try {
            privyLogin();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    };

    const handleHaitheLogin = async () => {
        loginMutation.mutate();
    };

    const handleDisconnect = async () => {
        try {
            // First logout from Haithe if logged in
            if (isHaitheLoggedIn) {
                await logoutMutation.mutateAsync();
            }
            // Then disconnect wallet
            await privyLogout();
        } catch (error) {
            console.error('Failed to disconnect:', error);
        }
    };

    // Loading state
    if (!ready) {
        return (
            <Button disabled variant="outline" className="rounded-md">
                <Skeleton className="w-24 h-4 bg-muted" />
            </Button>
        );
    }

    // Stage 1: Wallet not connected
    if (!isWalletConnected) {
        return (
            <Button
                onClick={handleWalletConnect}
                variant="outline"
                className="py-2 px-4 rounded-md"
            >
                <Icon name="Wallet" className="size-4 mr-2" />
                Connect Wallet
            </Button>
        );
    }

    // Stage 2: Wallet connected but not logged into Haithe
    if (!isHaitheLoggedIn) {
        return (
            <div className="flex items-center gap-3">
                <Button
                    onClick={handleHaitheLogin}
                    disabled={loginMutation.isPending}
                    className="py-2 px-4 rounded-md"
                >
                    {loginMutation.isPending ? (
                        <div className="flex items-center">
                            <Icon name="Loader" className="size-4 mr-2 animate-spin" />
                            Logging in...
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Icon name="Shield" className="size-4 mr-2" />
                            Sign in
                        </div>
                    )}
                </Button>
                <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    className="py-2 px-4 rounded-md"
                    disabled={logoutMutation.isPending}
                >
                    <Icon name="X" className="size-4" />
                </Button>
            </div>
        );
    }

    // Stage 3: Loading profile data
    if (profileQuery.isPending) {
        return (
            <Button disabled variant="outline" className="rounded-md">
                <Skeleton className="w-32 h-4 bg-muted" />
            </Button>
        );
    }

    // Stage 4: Profile error
    if (profileQuery.isError) {
        return (
            <div className="flex items-center gap-3">
                <Button
                    onClick={() => profileQuery.refetch()}
                    variant="outline"
                    className="py-2 px-4 rounded-md"
                >
                    <Icon name="RotateCcw" className="size-4 mr-2" />
                    Retry
                </Button>
                <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    size="sm"
                    disabled={logoutMutation.isPending}
                >
                    <Icon name="X" className="size-4" />
                </Button>
            </div>
        );
    }

    // Stage 5: Fully authenticated - show disconnect button
    return (
        <Button
            onClick={handleDisconnect}
            variant="outline"
            disabled={logoutMutation.isPending}
            className="py-2 px-4 rounded-md"
        >
            {logoutMutation.isPending ? (
                <div className="flex items-center">
                    <Icon name="Loader" className="size-4 mr-2 animate-spin" />
                    Disconnecting...
                </div>
            ) : (
                <div className="flex items-center">
                    <Icon name="LogOut" className="size-4 mr-2" />
                    Disconnect
                </div>
            )}
        </Button>
    );
}