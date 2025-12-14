// mcp/evm/functions/transferNative.ts
import type { z } from "zod";
import { createViemWalletClient } from "../evmClient";
import { transferNativeSchema } from "../schemas/transferNative.schema";

export const transferNative = {
	description: "Sends native token from configured wallet to recipient.",
	schema: transferNativeSchema,
	run: async (
		config: { rpcUrl: string; privateKey?: string },
		input: z.infer<typeof transferNativeSchema>,
	) => {
		if (!config.privateKey)
			throw new Error(
				"privateKey required in server config to send transactions.",
			);
		const { walletClient, address: from } = createViemWalletClient(
			config.rpcUrl,
			config.privateKey,
		);

		const txHash = await walletClient.sendTransaction({
			to: input.to as `0x${string}`,
			value: BigInt(input.value),
		} as any);

		return { txHash };
	},
};
