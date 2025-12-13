// mcp/evm/schemas/transferErc20.schema.ts
import { z } from "zod";

export const transferErc20Schema = z.object({
  token: z.string(),
  to: z.string(),
  amount: z.string().describe("Amount in wei"),
});
