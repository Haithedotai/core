// mcp/evm/schemas/getNftInfo.schema.ts
import { z } from "zod";
export const getNftInfoSchema = z.object({
	contract: z.string(),
	tokenId: z.string(),
});
