// mcp/evm/functions/getErc1155Balance.ts
import type { z } from "zod";
import { createViemPublicClient } from "../evmClient";
import { getErc1155BalanceSchema } from "../schemas/getErc1155Balance.schema";

const ERC1155_ABI = [
	{
		name: "balanceOf",
		type: "function",
		stateMutability: "view",
		inputs: [
			{ name: "owner", type: "address" },
			{ name: "id", type: "uint256" },
		],
		outputs: [{ type: "uint256" }],
	},
];

export const getErc1155Balance = {
	description: "Get balance of an ERC1155 token ID for an address.",
	schema: getErc1155BalanceSchema,
	run: async (config, input: z.infer<typeof getErc1155BalanceSchema>) => {
		const client = createViemPublicClient(config.rpcUrl);

		const balance = await client.readContract({
			address: input.contract as `0x${string}`,
			abi: ERC1155_ABI,
			functionName: "balanceOf",
			args: [input.owner as `0x${string}`, BigInt(input.tokenId)],
			authorizationList: [],
		});

		return {
			contract: input.contract,
			owner: input.owner,
			tokenId: input.tokenId,
			balance: balance.toString(),
		};
	},
};
