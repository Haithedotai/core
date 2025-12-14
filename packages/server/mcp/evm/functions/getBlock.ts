// mcp/evm/functions/getBlock.ts
import type { z } from "zod";
import { getBlockSchema } from "../schemas/getBlock.schema";
import { createViemPublicClient } from "../viemClient";

export const getBlock = {
	description: "Fetches a block by number, hash, or tag.",
	schema: getBlockSchema,
	run: async (config, input: z.infer<typeof getBlockSchema>) => {
		const client = createViemPublicClient(config.rpcUrl);

		const { blockNumberOrHash, includeTransactions = false } = input;

		let block;

		if (typeof blockNumberOrHash === "number") {
			block = await client.getBlock({
				blockNumber: BigInt(blockNumberOrHash),
				includeTransactions,
			});
		} else if (
			typeof blockNumberOrHash === "string" &&
			blockNumberOrHash.startsWith("0x") &&
			blockNumberOrHash.length === 66
		) {
			block = await client.getBlock({
				blockHash: blockNumberOrHash as `0x${string}`,
				includeTransactions,
			});
		} else if (typeof blockNumberOrHash === "string") {
			block = await client.getBlock({
				blockTag: blockNumberOrHash as any,
				includeTransactions,
			});
		} else {
			throw new Error("Invalid block identifier.");
		}

		if (!includeTransactions && block && "transactions" in block) {
			return {
				...block,
				transactions: block.transactions.map((tx) =>
					typeof tx === "object" ? tx.hash : tx,
				),
			};
		}

		return block;
	},
};
