import { zEvmAddress } from "@haithe/shared";
import { z } from "zod";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

const inputSchema = z.object({
	address: zEvmAddress().describe("Address to query balance for"),
	chainId: z.number().describe("chain id of the network to query balance on"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
	const { server } = config;

	server.registerTool(
		"get-native-token-balance",
		{
			title: "Get Native Token Balance",
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: true,
				title: "Get Native Token Balance",
			},
			description: "Get native token balance for an address on a given chain.",
			inputSchema,
		},
		async ({ address, chainId }) => {
			const client = createEvmClient({ chainId });

			const balance = await client.getBalance({
				address,
			});

			return {
				content: [
					{
						type: "text",
						text: `The balance of ${address} on ${client.chain.name} is ${balance}`,
					},
				],
			};
		},
	);
}
