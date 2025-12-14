// mcp/evm/functions/signMessage.ts
import type { z } from "zod";
import { createViemWalletClient } from "../evmClient";
import { signMessageSchema } from "../schemas/signMessage.schema";

export const signMessage = {
	description: "Sign an arbitrary message.",
	schema: signMessageSchema,
	run: async (config, input: z.infer<typeof signMessageSchema>) => {
		if (!config.privateKey) throw new Error("privateKey required");

		const { walletClient, address } = createViemWalletClient(
			config.rpcUrl,
			config.privateKey,
		);

		const signature = await walletClient.signMessage({
			account: address,
			message: input.message,
		});

		return { signature };
	},
};
