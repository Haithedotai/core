import { zEvmAddress } from "@haithe/shared";
import { z } from "zod";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

const inputSchema = z.object({
	address: zEvmAddress().describe("EVM address to query"),
	chainId: z.number().describe("Chain ID to query"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
	const { server } = config;

	server.registerTool(
		"get-native-token-balance",
		{
			title: "Get Native Token Balance",
			description: "Fetches the native token balance of an address.",
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: true,
				title: "Get Native Token Balance",
			},
			inputSchema,
		},
		async ({ address, chainId }) => {
			const client = createEvmClient({ chainId });

			const balance = await client.getBalance({ address });
			const ether = Number(balance) / 1e18;

			return {
				content: [
					{
						type: "text",
						text: `Balance of ${address} on ${client.chain.name}: ${balance} wei (${ether} ETH)`,
					},
				],
			};
		},
	);
}
