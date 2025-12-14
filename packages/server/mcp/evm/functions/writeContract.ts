// mcp/evm/functions/writeContract.ts
import type { z } from "zod";
import { createViemWalletClient } from "../evmClient";
import { writeContractSchema } from "../schemas/writeContract.schema";

export const writeContract = {
	description: "Executes a state-changing contract function.",
	schema: writeContractSchema,

	run: async (config, input: z.infer<typeof writeContractSchema>) => {
		if (!config.privateKey)
			throw new Error("privateKey required for writeContract");

		const { walletClient, address } = createViemWalletClient(
			config.rpcUrl,
			config.privateKey,
		);

		const txHash = await walletClient.writeContract({
			account: address,
			chain: walletClient.chain,
			address: input.address as `0x${string}`,
			abi: input.abi,
			functionName: input.functionName,
			args: input.args ?? [],
		});

		return { txHash };
	},
};
