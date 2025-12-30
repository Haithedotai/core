import { z } from "zod";
import { zEvmAddress } from "@haithe/shared";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

const ERC1155_ABI = [
	{
		name: "balanceOf",
		type: "function",
		stateMutability: "view",
		inputs: [
			{ name: "account", type: "address" },
			{ name: "id", type: "uint256" },
		],
		outputs: [{ type: "uint256" }],
	},
] as const;

const inputSchema = z.object({
	contract: zEvmAddress().describe("ERC1155 contract address"),
	owner: zEvmAddress().describe("Owner address to read balance for"),
	tokenId: z.number().describe("Token ID (uint256)"),
	chainId: z.number().describe("Target EVM chain ID"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
	const { server } = config;

	server.registerTool(
		"get-erc1155-balance",
		{
			title: "Get ERC1155 Balance",
			description: "Reads balance of an ERC1155 token for a given address.",
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: true,
				title: "Get ERC1155 Balance",
			},
			inputSchema,
		},
		async ({ contract, owner, tokenId, chainId }) => {
			const client = createEvmClient({ chainId });

			const balance = await client.readContract({
				account: client.account,
				address: contract,
				abi: ERC1155_ABI,
				functionName: "balanceOf",
				args: [owner, BigInt(tokenId)],
			});

			return {
				content: [
					{
						type: "text",
						text: `ERC1155 Balance:\nContract: ${contract}\nOwner: ${owner}\nToken ID: ${tokenId}\nBalance: ${balance.toString()}`,
					},
				],
			};
		},
	);
}
