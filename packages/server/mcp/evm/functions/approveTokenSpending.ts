// mcp/evm/functions/approveTokenSpending.ts
import { z } from "zod";
import { approveTokenSpendingSchema } from "../schemas/approveTokenSpending.schema";
import { createViemWalletClient } from "../viemClient";

const ERC20_APPROVE_ABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
];

export const approveTokenSpending = {
  description: "Approve a spender for ERC20 tokens.",
  schema: approveTokenSpendingSchema,
  run: async (config, input: z.infer<typeof approveTokenSpendingSchema>) => {
    if (!config.privateKey) throw new Error("privateKey required");

    const { walletClient } = createViemWalletClient(
      config.rpcUrl,
      config.privateKey
    );

    const txHash = await walletClient.writeContract({
      chain: walletClient.chain, 
      account: walletClient.account,
      address: input.token as `0x${string}`,
      abi: ERC20_APPROVE_ABI,
      functionName: "approve",
      args: [input.spender as `0x${string}`, BigInt(input.amount)],
    });

    return { txHash };
  },
};
