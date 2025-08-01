import { usePrivy } from "@privy-io/react-auth";
import { useChainId, useSwitchChain } from "wagmi";
import { hardhat, mainnet } from "viem/chains";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useHaitheApi } from "../../hooks/use-haithe-api";
import Icon from "../custom/Icon";
import { Link } from "@tanstack/react-router";

export default function Connect() {
    const { ready, authenticated, user, login: privyLogin, logout: privyLogout } = usePrivy();
    const api = useHaitheApi();
    const currentChainId = useChainId();
    const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

    // Get authentication state
    const isWalletConnected = ready && authenticated && user?.wallet?.address;
    const isHaitheLoggedIn = api.isLoggedIn();

    // Check if on correct network
    const isOnCorrectNetwork = currentChainId === hardhat.id;

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

    const handleNetworkSwitch = async () => {
        try {
            console.log('Attempting to switch to hardhat network:', hardhat.id);
            switchChain({ chainId: hardhat.id });
        } catch (error) {
            console.error('Failed to switch network:', error);
        }
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
                <Icon name="Wallet" className="size-4" />
                Connect Wallet
            </Button>
        );
    }

    // Stage 2: Wallet connected but wrong network
    if (!isOnCorrectNetwork) {
        return (
            <div className="flex items-center gap-3">
                <Button
                    onClick={handleNetworkSwitch}
                    disabled={isSwitchingChain}
                    variant="destructive"
                    className="py-2 px-4 rounded-md"
                >
                    {isSwitchingChain ? (
                        <div className="flex items-center">
                            <Icon name="Loader" className="size-4 mr-2 animate-spin" />
                            Switching...
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <Icon name="CircleAlert" className="size-4 mr-2" />
                            Switch to Hardhat
                            <span className="ml-2 text-xs opacity-70">
                                (Current: {currentChainId})
                            </span>
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

    // Stage 3: Wallet connected and on correct network but not logged into Haithe
    if (!isHaitheLoggedIn) {
        return (
            <div className="flex justify-center items-center gap-3">
                <Button
                    onClick={handleHaitheLogin}
                    disabled={loginMutation.isPending}
                    className="py-2 px-4 rounded-md w-f"
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

    // Stage 4: Loading profile data
    if (profileQuery.isPending) {
        return (
            <Button disabled variant="outline" className="rounded-md">
                <Skeleton className="w-32 h-4 bg-muted" />
            </Button>
        );
    }

    // Stage 5: Profile error
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
                    onClick={() => {
                        handleDisconnect();
                    }}
                    variant="outline"
                    size="sm"
                    disabled={logoutMutation.isPending}
                    className="py-2 px-4 rounded-md"
                >
                    <Icon name="X" className="size-4" />
                </Button>
            </div>
        );
    }

    // Stage 6: Fully authenticated and on correct network - show disconnect button
    return (
        <div>
            <Button
                onClick={handleDisconnect}
                variant="outline"
                disabled={logoutMutation.isPending}
                className="py-2 px-4 rounded-md"
            >
                {logoutMutation.isPending ? (
                    <div className="flex items-center">
                        <Icon name="Loader" className="size-4 animate-spin mr-2" />
                        Disconnecting...
                    </div>
                ) : (
                    <div className="flex items-center">
                        <Icon name="LogOut" className="size-4" />
                        <div className="hidden sm:block ml-2">
                            Disconnect
                        </div>
                    </div>
                )}
            </Button>
        </div>
    );
}