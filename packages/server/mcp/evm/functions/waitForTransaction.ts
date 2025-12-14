// mcp/evm/functions/waitForTransaction.ts
import { z } from "zod";
import { createViemPublicClient } from "../evmClient";
import { getTransactionSchema } from "../schemas/getTransaction.schema";

const waitTxSchema = getTransactionSchema.extend({
	confirmations: z.number().optional(),
});

export const waitForTransaction = {
	description:
		"Waits for a transaction to be mined and returns receipt (configurable confirmations).",
	schema: waitTxSchema,

	run: async (
		config: { rpcUrl: string },
		input: z.infer<typeof waitTxSchema>,
	) => {
		const publicClient = createViemPublicClient(config.rpcUrl);

		const receipt = await publicClient.waitForTransactionReceipt({
			hash: input.txHash as `0x${string}`,
			confirmations: input.confirmations ?? 1,
			pollingInterval: 1000,
			timeout: 60_000 * 10,
		});

		return receipt;
	},
};
