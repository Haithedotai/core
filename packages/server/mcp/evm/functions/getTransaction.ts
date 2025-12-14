// mcp/evm/functions/getTransaction.ts
import type { z } from "zod";
import { createViemPublicClient } from "../evmClient";
import { getTransactionSchema } from "../schemas/getTransaction.schema";

export const getTransaction = {
	description: "Fetch transaction by hash",
	schema: getTransactionSchema,
	run: async (
		config: { rpcUrl: string },
		input: z.infer<typeof getTransactionSchema>,
	) => {
		const publicClient = createViemPublicClient(config.rpcUrl);
		const tx = await publicClient.getTransaction({
			hash: input.txHash as `0x${string}`,
		});
		return tx;
	},
};
