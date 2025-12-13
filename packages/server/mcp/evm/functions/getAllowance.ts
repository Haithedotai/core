import { z } from "zod";
import { getAllowanceSchema } from "../schemas/getAllowance.schema";
import { createViemPublicClient } from "../viemClient";

const ERC20_ABI = [
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
];

export const getAllowance = {
  description: "Check ERC20 allowance for a spender.",
  schema: getAllowanceSchema,
  run: async (config, input: z.infer<typeof getAllowanceSchema>) => {
    const client = createViemPublicClient(config.rpcUrl);

    const allowance = await client.readContract({
      address: input.token as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [
        input.owner as `0x${string}`,
        input.spender as `0x${string}`
      ],
      authorizationList: [],     
    });

    return {
      token: input.token,
      owner: input.owner,
      spender: input.spender,
      allowance: allowance.toString(),
    };
  },
};
