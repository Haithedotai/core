// mcp/evm/schemas/signTypedData.schema.ts
import { z } from "zod";

export const signTypedDataSchema = z.object({
  domain: z.any(),
  types: z.any(),
  primaryType: z.string(),
  message: z.any(),
});
