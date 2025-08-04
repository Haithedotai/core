import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { useTheme } from './theme-provider';
import type { Chain } from 'viem';
import { hardhat, mainnet } from 'viem/chains';

const hyperion: Chain = {
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

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <PrivyProviderBase
      appId={process.env.BUN_PUBLIC_PRIVY_APP_ID!}
      config={{
        defaultChain: isProd ? hyperion : hardhat,
        supportedChains: isProd ? [hyperion, mainnet] : [hardhat, hyperion, mainnet],
        loginMethods: ["wallet", "google"],
        appearance: {
          theme: theme === "dark" ? "dark" : "light",
          landingHeader: "Sign in to Haithe",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          }
        }
      }}
    >
      {children}
    </PrivyProviderBase>
  )
}