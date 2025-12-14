// mcp/evm/schemas/getContractInterfaces.schema.ts
import { z } from "zod";
export const getContractInterfacesSchema = z.object({
	contract: z.string(),
});
