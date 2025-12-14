// mcp/evm/schemas/transferNative.schema.ts
import { z } from "zod";

export const transferNativeSchema = z.object({
	to: z.string().describe("Recipient address"),
	value: z
		.string()
		.describe(
			"Amount in wei (as string) or in ether depending on API; prefer wei)",
		),
	gasLimit: z.string().optional(),
	maxFeePerGas: z.string().optional(),
	maxPriorityFeePerGas: z.string().optional(),
});
