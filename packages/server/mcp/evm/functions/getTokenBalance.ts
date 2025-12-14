// mcp/evm/functions/getTokenBalance.ts
import type { z } from "zod";
import { getTokenBalanceSchema } from "../schemas/getTokenBalance.schema";
import { createViemPublicClient } from "../viemClient";

const ERC20_ABI = [
	{
		name: "decimals",
		stateMutability: "view",
		type: "function",
		inputs: [],
		outputs: [{ type: "uint8" }],
	},
	{
		name: "balanceOf",
		stateMutability: "view",
		type: "function",
		inputs: [{ name: "owner", type: "address" }],
		outputs: [{ name: "balance", type: "uint256" }],
	},
	{
		name: "symbol",
		stateMutability: "view",
		type: "function",
		inputs: [],
		outputs: [{ type: "string" }],
	},
	{
		name: "name",
		stateMutability: "view",
		type: "function",
		inputs: [],
		outputs: [{ type: "string" }],
	},
];

export const getTokenBalance = {
	description:
		"Get ERC20 token balance for an address; returns raw and formatted using decimals.",
	schema: getTokenBalanceSchema,
	run: async (config, input: z.infer<typeof getTokenBalanceSchema>) => {
		const { address, tokenAddress } = input;
		const publicClient = createViemPublicClient(config.rpcUrl);

		let tokenDecimals = input.decimals;

		if (tokenDecimals == null) {
			try {
				const dec = await publicClient.readContract({
					address: tokenAddress as `0x${string}`,
					abi: ERC20_ABI,
					functionName: "decimals",
					authorizationList: [],
				});

				tokenDecimals = Number(dec);
			} catch {
				tokenDecimals = 18;
			}
		}

		const raw = await publicClient.readContract({
			address: tokenAddress as `0x${string}`,
			abi: ERC20_ABI,
			functionName: "balanceOf",
			args: [address as `0x${string}`],
			authorizationList: [],
		});

		const rawStr = raw.toString();

		const divisor = BigInt("1" + "0".repeat(tokenDecimals));
		const integerPart = BigInt(rawStr) / divisor;
		const fractionPart = BigInt(rawStr) % divisor;

		const formatted =
			`${integerPart.toString()}.` +
			fractionPart.toString().padStart(Number(tokenDecimals), "0");

		let symbol = "TOKEN";
		try {
			const sym = await publicClient.readContract({
				address: tokenAddress as `0x${string}`,
				abi: ERC20_ABI,
				functionName: "symbol",
				authorizationList: [],
			});

			symbol = String(sym);
		} catch {}

		return {
			tokenAddress,
			address,
			raw: rawStr,
			decimals: tokenDecimals,
			formatted,
			symbol,
		};
	},
};
