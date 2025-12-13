// mcp/evm/schemas/getTransaction.schema.ts
import { z } from "zod";
export const getTransactionSchema = z.object({
  txHash: z.string().describe("Transaction hash to look up"),
});
