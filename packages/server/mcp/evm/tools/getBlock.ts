import { z } from "zod";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

const inputSchema = z.object({
    chainId: z.number(),
    blockNumber: z.number().optional(),
    blockHash: z.string().optional(),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
    const { server } = config;

    server.registerTool(
        "get-block",
        {
            title: "Get Block",
            description: "Fetch a block by number or hash.",
            annotations: {
                readOnlyHint: true,
                idempotentHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
            inputSchema,
        },
        async ({ chainId, blockNumber, blockHash }) => {
            const client = createEvmClient({ chainId });

            let block;

            if (blockNumber != null) {
                block = await client.getBlock({ blockNumber: BigInt(blockNumber) });
            } else if (blockHash) {
                block = await client.getBlock({
                    blockHash: blockHash as `0x${string}`,   
                });
            } else {
                throw new Error("Must provide blockNumber or blockHash");
            }

            return {
                content: [{ type: "text", text: JSON.stringify(block, null, 2) }],
            };
        }
    );
}
