// mcp/evm/schemas/getBalance.schema.ts
import { z } from "zod";

export const getBalanceSchema = z.object({
	address: z
		.string()
		.min(3)
		.describe("Address or ENS name to query balance for"),
	chainId: z
		.number()
		.optional()
		.describe("Optional chain id to pick network config"),
});
