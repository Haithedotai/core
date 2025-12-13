import { z } from "zod";
import { getChainInfoSchema } from "../schemas/getChainInfo.schema";
import { createViemPublicClient } from "../viemClient";

export const getChainInfo = {
  description: "Returns RPC chain information including chainId, blockNumber, and gasPrice.",
  schema: getChainInfoSchema,
  run: async (config, _input: z.infer<typeof getChainInfoSchema>) => {
    const client = createViemPublicClient(config.rpcUrl);

    const [chainId, blockNumber, gasPrice] = await Promise.all([
      client.getChainId(),
      client.getBlockNumber(),
      client.getGasPrice(),
    ]);

    return {
      chainId,
      blockNumber,
      gasPrice: gasPrice.toString(),
      rpcUrl: config.rpcUrl,
    };
  },
};
