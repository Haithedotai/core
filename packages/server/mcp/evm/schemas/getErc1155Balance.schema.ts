// mcp/evm/schemas/getErc1155Balance.schema.ts
import { z } from "zod";

export const getErc1155BalanceSchema = z.object({
  contract: z.string(),
  owner: z.string(),
  tokenId: z.string(),
});
