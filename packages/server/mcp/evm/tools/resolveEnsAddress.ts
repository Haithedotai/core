import { z } from "zod";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

const inputSchema = z.object({
    name: z.string().describe("ENS name to resolve"),
    chainId: z
        .number()
        .refine((id) => id === 1, {
            message: "ENS resolution is only supported on Ethereum mainnet (chainId = 1)",
        })
        .describe("Ethereum mainnet chain ID (1)"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
    const { server } = config;

    server.registerTool(
        "resolve-ens-address",
        {
            title: "Resolve ENS Address",
            description: "Resolves an ENS name to an Ethereum address (mainnet only).",
            annotations: {
                readOnlyHint: true,
                idempotentHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
            inputSchema,
        },
        async ({ name, chainId }) => {
            const client = createEvmClient({ chainId });

            const address = await client.getEnsAddress({ name });

            return {
                content: [
                    {
                        type: "text",
                        text: address
                            ? `Resolved ENS ${name} → ${address}`
                            : `ENS name ${name} not found`,
                    },
                ],
            };
        }
    );
}
