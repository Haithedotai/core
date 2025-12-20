import { z } from "zod";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

const inputSchema = z.object({
    txHash: z.string().describe("Transaction hash"),
    chainId: z.number().describe("Chain ID"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
    const { server } = config;

    server.registerTool(
        "get-transaction",
        {
            title: "Get Transaction",
            description: "Fetch a transaction by hash.",
            annotations: {
                readOnlyHint: true,
                idempotentHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
            inputSchema,
        },
        async ({ txHash, chainId }) => {
            const client = createEvmClient({ chainId });

           
            const normalizedHash = txHash.startsWith("0x")
                ? (txHash as `0x${string}`)
                : (`0x${txHash}` as `0x${string}`);

            const tx = await client.getTransaction({
                hash: normalizedHash,
            });

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(tx, null, 2),
                    },
                ],
            };
        }
    );
}
