import { zEvmAddress } from "@haithe/shared";
import { z } from "zod";
import { ERC20_ABI } from "../../../lib/evm/ERC20_ABI";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

const inputSchema = z.object({
	tokenAddress: zEvmAddress().describe("ERC20 token contract address"),
	chainId: z.number().describe("Chain ID of the network"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
	const { server } = config;

	server.registerTool(
		"get-erc20-decimals",
		{
			title: "Get ERC20 Token Decimals",
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: true,
				title: "Get ERC20 Token Decimals",
			},
			description:
				"Get the decimals for an ERC20 token contract on a specified chain.",
			inputSchema,
		},
		async ({ tokenAddress, chainId }) => {
			const client = createEvmClient({ chainId });

			const decimals = (await client.readContract({
				address: tokenAddress,
				abi: ERC20_ABI,
				functionName: "decimals",
				authorizationList: [],
			})) as number;

			return {
				content: [
					{
						type: "text",
						text: `Decimals for ERC20 token ${tokenAddress} on chain ${chainId}: ${decimals}`,
					},
				],
			};
		},
	);
}
