// mcp/evm/functions/getTokenMetadata.ts
import type { z } from "zod";
import { createViemPublicClient } from "../evmClient";
import { getTokenMetadataSchema } from "../schemas/getTokenMetadata.schema";

const ERC20_META_ABI = [
	{
		name: "name",
		type: "function",
		stateMutability: "view",
		inputs: [],
		outputs: [{ type: "string" }],
	},
	{
		name: "symbol",
		type: "function",
		stateMutability: "view",
		inputs: [],
		outputs: [{ type: "string" }],
	},
	{
		name: "decimals",
		type: "function",
		stateMutability: "view",
		inputs: [],
		outputs: [{ type: "uint8" }],
	},
	{
		name: "totalSupply",
		type: "function",
		stateMutability: "view",
		inputs: [],
		outputs: [{ type: "uint256" }],
	},
];

export const getTokenMetadata = {
	description:
		"Reads basic ERC20 token metadata: name, symbol, decimals, totalSupply.",
	schema: getTokenMetadataSchema,
	run: async (config, input: z.infer<typeof getTokenMetadataSchema>) => {
		const client = createViemPublicClient(config.rpcUrl);

		const [name, symbol, decimals, totalSupply] = await Promise.all([
			client.readContract({
				address: input.token as `0x${string}`,
				abi: ERC20_META_ABI,
				functionName: "name",
				authorizationList: [],
			}) as Promise<string>,

			client.readContract({
				address: input.token as `0x${string}`,
				abi: ERC20_META_ABI,
				functionName: "symbol",
				authorizationList: [],
			}) as Promise<string>,

			client.readContract({
				address: input.token as `0x${string}`,
				abi: ERC20_META_ABI,
				functionName: "decimals",
				authorizationList: [],
			}) as Promise<number>,

			client.readContract({
				address: input.token as `0x${string}`,
				abi: ERC20_META_ABI,
				functionName: "totalSupply",
				authorizationList: [],
			}) as Promise<bigint>,
		]);

		return {
			name,
			symbol,
			decimals,
			totalSupply: totalSupply.toString(),
		};
	},
};
