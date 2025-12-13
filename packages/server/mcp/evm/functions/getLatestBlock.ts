// mcp/evm/functions/getLatestBlock.ts
import { createViemPublicClient } from "../viemClient";

export const getLatestBlock = {
  description: "Returns the latest block number and basic metadata.",
  schema: undefined,
  run: async (config: { rpcUrl: string }) => {
    const publicClient = createViemPublicClient(config.rpcUrl);

    
    const blockNumber = await publicClient.getBlockNumber();

    
    const block = await publicClient.getBlock({
      blockNumber,     
      includeTransactions: false,
    });

    return { blockNumber, block };
  },
};
