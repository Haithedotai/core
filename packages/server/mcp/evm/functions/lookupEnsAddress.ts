// mcp/evm/functions/lookupEnsAddress.ts
import { z } from "zod";
import { lookupEnsAddressSchema } from "../schemas/lookupEnsAddress.schema";
import { createViemPublicClient } from "../viemClient";

export const lookupEnsAddress = {
  description: "Reverse lookup ENS name for an address.",
  schema: lookupEnsAddressSchema,
  run: async (config, input: z.infer<typeof lookupEnsAddressSchema>) => {
    const client = createViemPublicClient(config.rpcUrl);

    const name = await client.getEnsName({ address: input.address as `0x${string}` });

    return {
      address: input.address,
      ens: name ?? null,
      found: !!name,
    };
  },
};
