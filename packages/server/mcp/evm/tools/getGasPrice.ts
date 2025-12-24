import { z } from "zod";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

const inputSchema = z.object({
    chainId: z.number().describe("Chain ID"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
    const { server } = config;

    server.registerTool(
        "get-gas-price",
        {
            title: "Get Gas Price",
            description: "Returns current gas price of a chain.",
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

            const gasPrice = await client.getGasPrice();

            return {
                content: [
                    { type: "text", text: `Gas price: ${gasPrice}` },
                ],
            };
        }
    );
}
