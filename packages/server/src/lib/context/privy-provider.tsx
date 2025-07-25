import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { useTheme } from './theme-provider';
import { hardhat, mainnet } from 'viem/chains';

export function PrivyProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();

    return (
        <PrivyProviderBase
            appId={process.env.BUN_PUBLIC_PRIVY_APP_ID!}
            config={{
                defaultChain: hardhat,
                supportedChains: [hardhat, mainnet],
                loginMethods: ["wallet"],
                appearance: {
                    theme: theme === "dark" ? "dark" : "light",
                    landingHeader: "Sign in to Haithe",
                }
            }}
        >
            {children}
        </PrivyProviderBase>
    )
}