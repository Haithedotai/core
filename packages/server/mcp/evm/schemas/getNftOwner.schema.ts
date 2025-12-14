// mcp/evm/schemas/getNftOwner.schema.ts
import { z } from "zod";

export const getNftOwnerSchema = z.object({
	contract: z.string(),
	tokenId: z.string(),
});
