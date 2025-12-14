// mcp/evm/schemas/getBlock.schema.ts
import { z } from "zod";

export const getBlockSchema = z.object({
	blockNumberOrHash: z
		.union([z.number(), z.string()])
		.describe("Block number or block hash"),
	includeTransactions: z
		.boolean()
		.optional()
		.describe("If true, include full transactions array"),
});
