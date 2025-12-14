// mcp/evm/functions/signTypedData.ts
import type { z } from "zod";
import { createViemWalletClient } from "../evmClient";
import { signTypedDataSchema } from "../schemas/signTypedData.schema";

export const signTypedData = {
	description: "Sign EIP-712 typed data.",
	schema: signTypedDataSchema,
	run: async (config, input: z.infer<typeof signTypedDataSchema>) => {
		if (!config.privateKey) throw new Error("privateKey required");

		const { walletClient, address } = createViemWalletClient(
			config.rpcUrl,
			config.privateKey,
		);

		const signature = await walletClient.signTypedData({
			account: address,
			domain: input.domain,
			types: input.types,
			primaryType: input.primaryType,
			message: input.message,
		});

		return { signature };
	},
};
