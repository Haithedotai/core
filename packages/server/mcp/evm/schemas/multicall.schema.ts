// mcp/evm/schemas/multicall.schema.ts
import { z } from "zod";

export const multicallSchema = z.object({
	calls: z.array(
		z.object({
			address: z.string(),
			abi: z.any(),
			functionName: z.string(),
			args: z.array(z.any()).optional(),
		}),
	),
});
