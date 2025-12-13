// mcp/evm/schemas/signMessage.schema.ts
import { z } from "zod";

export const signMessageSchema = z.object({
  message: z.string(),
});
