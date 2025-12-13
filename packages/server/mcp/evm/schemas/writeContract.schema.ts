import { z } from "zod";

export const writeContractSchema = z.object({
  address: z.string(),
  abi: z.any(),
  functionName: z.string(),
  args: z.array(z.any()).optional(),
});
