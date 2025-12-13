// mcp/evm/functions/signTypedData.ts
import { z } from "zod";
import { signTypedDataSchema } from "../schemas/signTypedData.schema";
import { createViemWalletClient } from "../viemClient";

export const signTypedData = {
  description: "Sign EIP-712 typed data.",
  schema: signTypedDataSchema,
  run: async (config, input: z.infer<typeof signTypedDataSchema>) => {
    if (!config.privateKey) throw new Error("privateKey required");

    const { walletClient, address } = createViemWalletClient(config.rpcUrl, config.privateKey);

    const signature = await walletClient.signTypedData({
      account: address,
      domain: input.domain,
      types: input.types,
      primaryType: input.primaryType,
      message: input.message,
    });

    return { signature };
  },
};
