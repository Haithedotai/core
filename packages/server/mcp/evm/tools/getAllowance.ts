import { zEvmAddress } from "@haithe/shared";
import { z } from "zod";
import { ERC20_ABI } from "../../../lib/evm/ERC20_ABI";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

const inputSchema = z.object({
    tokenAddress: zEvmAddress().describe("ERC20 token contract address"),
    owner: zEvmAddress().describe("Owner address"),
    spender: zEvmAddress().describe("Spender address"),
    chainId: z.number().describe("Chain ID of the network"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
    const { server } = config;

    server.registerTool(
        "get-allowance",
        {
            title: "Get ERC20 Allowance",
            annotations: {
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: true,
                title: "Get ERC20 Allowance",
            },
            description: "Reads the allowance of a spender for a given ERC20 token.",
            inputSchema,
        },
        async ({ tokenAddress, owner, spender, chainId }) => {
            const client = createEvmClient({ chainId });

            const allowance = await client.readContract({
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: "allowance",
                args: [owner, spender],
            }) as bigint; 

            return {
                content: [
                    {
                        type: "text",
                        text: `Allowance of spender ${spender} by owner ${owner} is ${allowance.toString()}`,
                    },
                ],
            };
        },
    );
}
