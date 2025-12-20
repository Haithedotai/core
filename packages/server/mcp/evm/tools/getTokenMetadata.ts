import { zEvmAddress } from "@haithe/shared";
import { z } from "zod";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";
import { ERC20_ABI } from "../../../lib/evm/ERC20_ABI";

const inputSchema = z.object({
	tokenAddress: zEvmAddress().describe("ERC20 token contract address"),
	chainId: z.number().describe("Chain ID of the network"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
	const { server } = config;

	server.registerTool(
		"get-token-metadata",
		{
			title: "Get ERC20 Token Metadata",
			description: "Reads name, symbol, decimals and total supply from an ERC20 token.",
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: true,
				title: "Get ERC20 Token Metadata",
			},
			inputSchema,
		},
		async ({ tokenAddress, chainId }) => {
			const client = createEvmClient({ chainId });

			const [name, symbol, decimals, totalSupply] = await Promise.all([
				client.readContract({
					address: tokenAddress,
					abi: ERC20_ABI,
					functionName: "name",
				}),
				client.readContract({
					address: tokenAddress,
					abi: ERC20_ABI,
					functionName: "symbol",
				}),
				client.readContract({
					address: tokenAddress,
					abi: ERC20_ABI,
					functionName: "decimals",
				}),
				client.readContract({
					address: tokenAddress,
					abi: ERC20_ABI,
					functionName: "totalSupply",
				}),
			]);

			return {
				content: [
					{
						type: "text",
						text:
							`Token Metadata:\n` +
							`Name: ${name}\n` +
							`Symbol: ${symbol}\n` +
							`Decimals: ${decimals}\n` +
							`Total Supply: ${totalSupply}`,
					},
				],
			};
		},
	);
}
