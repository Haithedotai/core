// mcp/evm/functions/readContract.ts
import { z } from "zod";
import { readContractSchema } from "../schemas/readContract.schema";
import { createViemPublicClient } from "../viemClient";

export const readContract = {
  description: "Calls a read-only smart contract function.",
  schema: readContractSchema,
  run: async (config, input: z.infer<typeof readContractSchema>) => {
    const client = createViemPublicClient(config.rpcUrl);

   
    const params: any = {
      address: input.address as `0x${string}`,
      abi: input.abi,
      functionName: input.functionName,
      args: input.args ?? [],
      authorizationList: [],     
    };

    const result = await client.readContract(params);

    return { result };
  },
};
