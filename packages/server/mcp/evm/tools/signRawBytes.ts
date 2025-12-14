import { zHex } from "@haithe/shared";
import { z } from "zod";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

const inputSchema = z.object({
	bytesHex: zHex(),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
	const { server, privateKey } = config;

	server.registerTool(
		"sign-message",
		{
			title: "Sign Message",
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: true,
				title: "Sign Message",
			},
			description: "Sign a message with a user's private key.",
			inputSchema,
		},
		async ({ bytesHex }) => {
			const client = createEvmClient({ privateKey });

			const signature = await client.account.signMessage({
				message: { raw: bytesHex },
			});

			return {
				content: [
					{
						type: "text",
						text: `The signature of the message is ${signature}`,
					},
				],
			};
		},
	);
}
