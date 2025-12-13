import { z } from "zod";

export const resolveEnsNameSchema = z.object({
  ens: z.string().describe("ENS name, e.g. vitalik.eth")
});
