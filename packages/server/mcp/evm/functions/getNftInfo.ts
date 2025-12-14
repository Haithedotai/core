// mcp/evm/functions/getNftInfo.ts
import type { z } from "zod";
import { createViemPublicClient } from "../evmClient";
import { getNftInfoSchema } from "../schemas/getNftInfo.schema";

const ERC721_ABI = [
	{
		name: "ownerOf",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "tokenId", type: "uint256" }],
		outputs: [{ type: "address" }],
	},
	{
		name: "tokenURI",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "tokenId", type: "uint256" }],
		outputs: [{ type: "string" }],
	},
];

export const getNftInfo = {
	description: "Get metadata, owner, and tokenURI for an ERC721 token.",
	schema: getNftInfoSchema,
	run: async (config, input: z.infer<typeof getNftInfoSchema>) => {
		const client = createViemPublicClient(config.rpcUrl);

		const owner = (await client.readContract({
			address: input.contract as `0x${string}`,
			abi: ERC721_ABI,
			functionName: "ownerOf",
			args: [BigInt(input.tokenId)],
			authorizationList: [],
		})) as `0x${string}`;

		const tokenUri = (await client.readContract({
			address: input.contract as `0x${string}`,
			abi: ERC721_ABI,
			functionName: "tokenURI",
			args: [BigInt(input.tokenId)],
			authorizationList: [],
		})) as string;

		let metadata = null;
		try {
			const url = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
			metadata = await fetch(url).then((r) => r.json());
		} catch {}

		return {
			contract: input.contract,
			tokenId: input.tokenId,
			owner,
			tokenUri,
			metadata,
		};
	},
};
