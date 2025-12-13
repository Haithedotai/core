// mcp/evm/functions/getSupportedNetworks.ts
export const getSupportedNetworks = {
  description: "Lists supported EVM networks (static list).",
  schema: undefined,
  run: async () => ({
    networks: [
      { name: "Ethereum Mainnet", chainId: 1 },
      { name: "Polygon", chainId: 137 },
      { name: "Arbitrum One", chainId: 42161 },
      { name: "Optimism", chainId: 10 },
      { name: "Base", chainId: 8453 },
    ],
  }),
};
