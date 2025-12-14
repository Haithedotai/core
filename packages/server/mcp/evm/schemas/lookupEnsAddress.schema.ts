import { z } from "zod";

export const lookupEnsAddressSchema = z.object({
	address: z.string().describe("Ethereum address to reverse-lookup ENS name"),
});
