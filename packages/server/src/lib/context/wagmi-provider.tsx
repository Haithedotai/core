import { http } from "wagmi";
import { hardhat, mainnet, type Chain } from "viem/chains";

import {
  createConfig,
  WagmiProvider as WagmiProviderBase,
} from "@privy-io/wagmi";

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

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

export const config = createConfig({
  chains: isProd ? [mainnet, hyperion] : [mainnet, hardhat],
  transports: {
    [mainnet.id]: http(),
    [hyperion.id]: http(),
    [hardhat.id]: http(),
  },
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiProviderBase config={config}>{children}</WagmiProviderBase>;
}
