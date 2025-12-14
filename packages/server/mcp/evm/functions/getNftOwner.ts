// mcp/evm/functions/getNftOwner.ts
import type { z } from "zod";
import { getNftOwnerSchema } from "../schemas/getNftOwner.schema";
import { createViemPublicClient } from "../viemClient";

const ERC721_OWNER_ABI = [
	{
		name: "ownerOf",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "tokenId", type: "uint256" }],
		outputs: [{ type: "address" }],
	},
];

export const getNftOwner = {
	description: "Get owner of ERC721 token ID.",
	schema: getNftOwnerSchema,
	run: async (config, input: z.infer<typeof getNftOwnerSchema>) => {
		const client = createViemPublicClient(config.rpcUrl);

		const owner = (await client.readContract({
			address: input.contract as `0x${string}`,
			abi: ERC721_OWNER_ABI,
			functionName: "ownerOf",
			args: [BigInt(input.tokenId)],
			authorizationList: [],
		})) as `0x${string}`;

		return {
			contract: input.contract,
			tokenId: input.tokenId,
			owner,
		};
	},
};
