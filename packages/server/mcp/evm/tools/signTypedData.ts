import { z } from "zod";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

const inputSchema = z.object({
    chainId: z.number().describe("Chain ID for the EVM network"),

    domain: z.object({
        name: z.string(),
        version: z.string(),
        chainId: z.number(),
        verifyingContract: z.string().optional(),
        salt: z.string().optional(),
    }),

    types: z.record(
        z.string(),
        z.array(
            z.object({
                name: z.string(),
                type: z.string(),
            })
        )
    ),

    primaryType: z.string(),
    message: z.record(z.string(), z.any()),
});


export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
    const { server, privateKey } = config;

    server.registerTool(
        "sign-typed-data",
        {
            title: "Sign Typed Data (EIP-712)",
            annotations: {
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true,
                title: "Sign Typed Data (EIP-712)",
            },
            description: "Sign typed structured data using EIP-712.",
            inputSchema,
        },

        async ({ chainId, domain, types, primaryType, message }) => {
            const client = createEvmClient({ chainId, privateKey });

            
            const normalizedDomain = {
                ...domain,
                chainId: BigInt(domain.chainId),

                verifyingContract: domain.verifyingContract
                    ? (domain.verifyingContract.startsWith("0x")
                        ? domain.verifyingContract
                        : (`0x${domain.verifyingContract}`)) as `0x${string}`
                    : undefined,

                salt: domain.salt
                    ? (domain.salt.startsWith("0x")
                        ? domain.salt
                        : (`0x${domain.salt}`)) as `0x${string}`
                    : undefined,
            };

            
            const signature = await client.account.signTypedData({
                domain: normalizedDomain,
                types,
                primaryType,
                message,
            });

            return {
                content: [
                    {
                        type: "text",
                        text: `Signature: ${signature}`,
                    },
                ],
            };
        }
    );
}
