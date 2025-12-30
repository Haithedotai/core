import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";
import { z } from "zod";

const inputSchema = z.object({
    chainId: z.number().describe("Chain ID"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
    const { server, privateKey } = config;

    server.registerTool(
        "get-own-address",
        {
            title: "Get Own Address",
            description: "Returns the wallet address tied to MCP private key.",
            annotations: {
                readOnlyHint: true,
                idempotentHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
            inputSchema,
        },
        async ({ chainId }) => {
            const client = createEvmClient({ chainId, privateKey });

            return {
                content: [
                    {
                        type: "text",
                        text: `Your address: ${client.account.address}`,
                    },
                ],
            };
        }
    );
}
