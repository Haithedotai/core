// mcp/evm/functions/getTransactionReceipt.ts
import { z } from "zod";
import { getTransactionSchema } from "../schemas/getTransaction.schema";
import { createViemPublicClient } from "../viemClient";

export const getTransactionReceipt = {
  description: "Get transaction receipt by hash",
  schema: getTransactionSchema,
  run: async (config: { rpcUrl: string }, input: z.infer<typeof getTransactionSchema>) => {
    const publicClient = createViemPublicClient(config.rpcUrl);
    const receipt = await publicClient.getTransactionReceipt({ hash: input.txHash as `0x${string}` });
    return receipt;
  },
};
