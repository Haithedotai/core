import { http } from "wagmi";
import { hardhat, mainnet } from "viem/chains";

import {
  createConfig,
  WagmiProvider as WagmiProviderBase,
} from "@privy-io/wagmi";

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

export const config = createConfig({
  chains: [hardhat, mainnet],
  transports: {
    [hardhat.id]: http(),
    [mainnet.id]: http(),
  },
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiProviderBase config={config}>{children}</WagmiProviderBase>;
}
