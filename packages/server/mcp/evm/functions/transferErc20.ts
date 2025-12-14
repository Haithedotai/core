// mcp/evm/functions/transferErc20.ts
import type { z } from "zod";
import { createViemWalletClient } from "../evmClient";
import { transferErc20Schema } from "../schemas/transferErc20.schema";

const ERC20_ABI = [
	{
		name: "transfer",
		type: "function",
		stateMutability: "nonpayable",
		inputs: [
			{ name: "to", type: "address" },
			{ name: "value", type: "uint256" },
		],
		outputs: [{ type: "bool" }],
	},
];

export const transferErc20 = {
	description: "Transfer ERC20 tokens to a recipient.",
	schema: transferErc20Schema,
	run: async (config, input: z.infer<typeof transferErc20Schema>) => {
		if (!config.privateKey) throw new Error("privateKey required");

		const { walletClient, address } = createViemWalletClient(
			config.rpcUrl,
			config.privateKey,
		);

		const txHash = await walletClient.writeContract({
			account: address,
			chain: walletClient.chain,
			address: input.token as `0x${string}`,
			abi: ERC20_ABI,
			functionName: "transfer",
			args: [input.to as `0x${string}`, BigInt(input.amount)],
		});

		return { txHash };
	},
};
