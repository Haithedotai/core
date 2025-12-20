import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";
import { z } from "zod";

const inputSchema = z.object({
    chainId: z.number().describe("Chain ID"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
    const { server } = config;

    server.registerTool(
        "get-latest-block",
        {
            title: "Get Latest Block",
            description: "Fetch latest block with all metadata.",
            annotations: {
                readOnlyHint: true,
                idempotentHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
            inputSchema,
        },
        async ({ chainId }) => {
            const client = createEvmClient({ chainId });
            const blockNumber = await client.getBlockNumber();
            const block = await client.getBlock({ blockNumber });

            return {
                content: [
                    { type: "text", text: JSON.stringify(block, null, 2) },
                ],
            };
        }
    );
}
