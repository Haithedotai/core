import { z } from "zod";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

const inputSchema = z.object({
    txHash: z.string().describe("Transaction hash"),
    confirmations: z.number().optional().describe("Confirmations to wait for"),
    chainId: z.number().describe("Chain ID"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
    const { server } = config;

    server.registerTool(
        "wait-for-and-get-txn-receipt",
        {
            title: "Wait For And Get Transaction Receipt",
            description: "Waits for a transaction and returns its receipt.",
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true,
            },
            inputSchema,
        },
        async ({ txHash, chainId, confirmations }) => {
            const client = createEvmClient({ chainId });

            const receipt = await client.waitForTransactionReceipt({
                hash: txHash as `0x${string}`,   
                confirmations: confirmations ?? 1,
            });

            return {
                content: [
                    { type: "text", text: JSON.stringify(receipt, null, 2) }
                ],
            };
        }
    );
}
