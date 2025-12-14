// mcp/evm/schemas/getContractAbi.schema.ts
import { z } from "zod";

export const getContractAbiSchema = z.object({
	contract: z.string(),
	etherscanApiKey: z.string(),
});
