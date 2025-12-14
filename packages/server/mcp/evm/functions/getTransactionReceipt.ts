// mcp/evm/functions/getTransactionReceipt.ts
import type { z } from "zod";
import { createViemPublicClient } from "../evmClient";
import { getTransactionSchema } from "../schemas/getTransaction.schema";

export const getTransactionReceipt = {
	description: "Get transaction receipt by hash",
	schema: getTransactionSchema,
	run: async (
		config: { rpcUrl: string },
		input: z.infer<typeof getTransactionSchema>,
	) => {
		const publicClient = createViemPublicClient(config.rpcUrl);
		const receipt = await publicClient.getTransactionReceipt({
			hash: input.txHash as `0x${string}`,
		});
		return receipt;
	},
};
