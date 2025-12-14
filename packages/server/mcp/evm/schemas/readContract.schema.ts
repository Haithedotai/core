import { z } from "zod";

export const readContractSchema = z.object({
	address: z.string(),
	abi: z.any(),
	functionName: z.string(),
	args: z.array(z.any()).optional(),
});
