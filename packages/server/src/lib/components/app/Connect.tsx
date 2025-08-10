import { usePrivy } from "@privy-io/react-auth";
import { useChainId, useSwitchChain } from "wagmi";
import { hardhat, mainnet } from "viem/chains";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useHaitheApi } from "../../hooks/use-haithe-api";
import Icon from "../custom/Icon";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

// Define Hyperion testnet chain
const hyperion = {
    id: 133717,
    name: "Hyperion Testnet",
    nativeCurrency: {
        name: "tMetis",
        symbol: "TMETIS",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["https://hyperion-testnet.metisdevops.link"],
        },
    },
};

const isProd = process.env.NODE_ENV === "production";
const correctChainId = isProd ? hyperion.id : hardhat.id;
const correctChainName = isProd ? "Hyperion Testnet" : "Hardhat";

export default function Connect() {
    const { ready, authenticated, user, login: privyLogin, logout: privyLogout } = usePrivy();
    const api = useHaitheApi();
    const currentChainId = useChainId();
    const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

    // Get authentication state
    const isWalletConnected = ready && authenticated && user?.wallet?.address;
    const isHaitheLoggedIn = api.isLoggedIn();
    const isClientInitialized = api.isClientInitialized();

    // Check if wallet client is ready for signing (important for embedded wallets)
    const isWalletClientReady = api.isWeb3Ready();

    // Check if on correct network - also handle case where currentChainId might be undefined
    const isOnCorrectNetwork = currentChainId && currentChainId === correctChainId;

    // Get profile data when logged in
    const profileQuery = api.profile();

    // Mutations
    const loginMutation = api.login;
    const logoutMutation = api.logout;

    // Ref to prevent multiple auto-login attempts
    const autoLoginAttempted = useRef(false);
    const retryLoginTimer = useRef<NodeJS.Timeout | null>(null);

    // Auto-login effect: when wallet is connected, on correct network, and wallet client is ready
    useEffect(() => {
        const shouldAutoLogin = isWalletConnected &&
            isOnCorrectNetwork &&
            isClientInitialized &&
            isWalletClientReady &&
            !isHaitheLoggedIn &&
            !loginMutation.isPending &&
            !autoLoginAttempted.current;

        if (shouldAutoLogin) {
            console.log('Auto-triggering Haithe login after wallet connection and readiness...');
            autoLoginAttempted.current = true;

            // Longer delay for embedded wallets to ensure they're fully ready
            const timeoutId = setTimeout(() => {
                // Double-check that wallet client is still ready and we need to login
                if (autoLoginAttempted.current && !loginMutation.isPending && api.isWeb3Ready()) {
                    loginMutation.mutate(undefined, {
                        onError: (error) => {
                            console.error('Auto-login failed:', error);

                            // Check if it's a wallet readiness issue (common with embedded wallets)
                            if (error.message?.includes('Wallet client is not ready') && !retryLoginTimer.current) {
                                console.log('Auto-login failed due to wallet not ready, retrying in 2 seconds...');

                                // Retry once after a longer delay for embedded wallets
                                retryLoginTimer.current = setTimeout(() => {
                                    if (api.isWeb3Ready() && !api.isLoggedIn()) {
                                        console.log('Retrying auto-login for embedded wallet...');
                                        loginMutation.mutate(undefined, {
                                            onError: () => {
                                                autoLoginAttempted.current = false;
                                                console.log('Auto-login retry failed - user can login manually');
                                            }
                                        });
                                    }
                                    retryLoginTimer.current = null;
                                }, 2000);
                            } else {
                                // Reset the flag so user can try again manually
                                autoLoginAttempted.current = false;
                            }
                        }
                    });
                } else if (!api.isWeb3Ready()) {
                    // Reset flag if wallet client is not ready
                    autoLoginAttempted.current = false;
                    console.log('Auto-login postponed: wallet client not ready');
                }
            }, 500); // Increased delay for embedded wallets

            // Cleanup timeout on unmount or deps change
            return () => clearTimeout(timeoutId);
        }
    }, [isWalletConnected, isOnCorrectNetwork, isClientInitialized, isHaitheLoggedIn]); // Removed isWalletClientReady from deps to prevent re-triggers

    // Reset auto-login flag when wallet disconnects or user logs in
    useEffect(() => {
        if (!isWalletConnected || isHaitheLoggedIn) {
            autoLoginAttempted.current = false;
            // Clear retry timer if user disconnects or logs in
            if (retryLoginTimer.current) {
                clearTimeout(retryLoginTimer.current);
                retryLoginTimer.current = null;
            }
        }
    }, [isWalletConnected, isHaitheLoggedIn]);

    // Cleanup retry timer on unmount
    useEffect(() => {
        return () => {
            if (retryLoginTimer.current) {
                clearTimeout(retryLoginTimer.current);
                retryLoginTimer.current = null;
            }
        };
    }, []);

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
            console.log(`Attempting to switch to ${correctChainName} network:`, correctChainId);
            switchChain({ chainId: correctChainId });
        } catch (error) {
            console.error('Failed to switch network:', error);
        }
    };

    const handleDisconnect = async () => {
        try {
            if (isHaitheLoggedIn) {
                await logoutMutation.mutateAsync();
            }
            await privyLogout();
            localStorage.clear();
            window.location.href = "/";
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

    // Stage 2: Wallet connected but wrong network or network not detected
    if (!isOnCorrectNetwork) {
        const currentNetworkName = currentChainId === mainnet.id ? "Ethereum Mainnet" :
            currentChainId === hardhat.id ? "Hardhat" :
                currentChainId === hyperion.id ? "Hyperion Testnet" :
                    `Chain ID ${currentChainId}`;

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
                            Switch to {correctChainName}
                            <span className="ml-2 text-xs opacity-70">
                                (Current: {currentNetworkName})
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
        // Show loading state during auto-login or if manual login is pending
        const isLoggingIn = loginMutation.isPending;

        return (
            <div className="flex justify-center items-center gap-3">
                <Button
                    onClick={handleHaitheLogin}
                    disabled={isLoggingIn}
                    className="py-2 px-4 rounded-md w-f"
                >
                    {isLoggingIn ? (
                        <div className="flex items-center">
                            <Icon name="Loader" className="size-4 mr-2 animate-spin" />
                            Signing in...
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