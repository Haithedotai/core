import { zEvmAddress } from "@haithe/shared";
import { z } from "zod";
import { ERC20_ABI } from "../../../lib/evm/ERC20_ABI";
import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";
import { createEvmClient } from "../evmClient";

const inputSchema = z.object({
	tokenAddress: zEvmAddress().describe("ERC20 token contract address"),
	to: zEvmAddress().describe("Address of the recipient"),
	amount: z.number().describe("Amount to transfer as per the token's decimals"),
	chainId: z.number().describe("ChainId of the network"),
});

export default function (config: McpToolRegistrationConfig<EvmMcpConfig>) {
	const { server, privateKey } = config;

	server.registerTool(
		"transfer-erc20",
		{
			title: "Transfer ERC20 Tokens",
			annotations: {
				readOnlyHint: false,
				destructiveHint: true,
				idempotentHint: false,
				openWorldHint: true,
				title: "Transfer ERC20 Tokens",
			},
			description:
				"Transfer ERC20 tokens to a recipient address on a specified chain.",
			inputSchema,
		},
		async ({ tokenAddress, to, amount, chainId }) => {
			const client = createEvmClient({ chainId, privateKey });

			const txHash = await client.writeContract({
				account: client.account,
				chain: client.chain,
				address: tokenAddress,
				abi: ERC20_ABI,
				functionName: "transfer",
				args: [to, BigInt(amount)],
			});

			return {
				content: [
					{
						type: "text",
						text: `Successfully initiated ERC20 transfer. Transaction hash: ${txHash}`,
					},
				],
			};
		},
	);
}
