import { zEvmAddress } from "@haithe/shared";
import { z } from "zod";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";
import { ERC721_ABI } from "../../../lib/evm/ERC721_ABI";

const inputSchema = z.object({
	contractAddress: zEvmAddress().describe("ERC721 contract address"),
	tokenId: z.string().describe("Token ID to query owner for"),
	chainId: z.number().describe("Chain ID of the network"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
	const { server } = config;

	server.registerTool(
		"get-nft-owner",
		{
			title: "Get NFT Owner",
			description: "Fetch the owner of a given ERC721 token ID.",
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: true,
				title: "Get NFT Owner",
			},
			inputSchema,
		},
		async ({ contractAddress, tokenId, chainId }) => {
			const client = createEvmClient({ chainId });

			const owner = await client.readContract({
				address: contractAddress,
				abi: ERC721_ABI,
				functionName: "ownerOf",
				args: [BigInt(tokenId)],
			});

			return {
				content: [
					{
						type: "text",
						text: `Owner of token ${tokenId} on ${contractAddress}: ${owner}`,
					},
				],
			};
		},
	);
}
