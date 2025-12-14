// mcp/evm/functions/getBalance.ts
import type { z } from "zod";
import { createViemPublicClient } from "../evmClient";
import { getBalanceSchema } from "../schemas/getBalance.schema";

export const getBalance = {
	description:
		"Returns the native (ETH) balance for an address (wei and formatted).",
	schema: getBalanceSchema,
	run: async (
		config: { rpcUrl: string },
		input: z.infer<typeof getBalanceSchema>,
	) => {
		const { address } = input;
		const publicClient = createViemPublicClient(config.rpcUrl);

		const balanceWei = await publicClient.getBalance({
			address: address as `0x${string}`,
		});

		const balanceEther = (Number(balanceWei) / 1e18).toString();

		return {
			address,
			wei: balanceWei.toString(),
			ether: balanceEther,
		};
	},
};
