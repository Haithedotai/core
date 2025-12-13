// mcp/evm/schemas/approveTokenSpending.schema.ts
import { z } from "zod";

export const approveTokenSpendingSchema = z.object({
  token: z.string(),
  spender: z.string(),
  amount: z.string(),
});
