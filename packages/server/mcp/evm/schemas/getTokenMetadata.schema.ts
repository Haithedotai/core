// mcp/evm/schemas/getTokenMetadata.schema.ts
import { z } from "zod";
export const getTokenMetadataSchema = z.object({
	token: z.string(),
});
