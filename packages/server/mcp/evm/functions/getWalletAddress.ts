// mcp/evm/functions/getWalletAddress.ts
import { z } from "zod";
import { createViemWalletClient } from "../evmClient";
import { getWalletAddressSchema } from "../schemas/getWalletAddress.schema";

export const getWalletAddress = {
	description: "Returns the EVM address for the configured private key.",
	schema: getWalletAddressSchema,
	run: async (config: { rpcUrl: string; privateKey?: string }) => {
		if (!config.privateKey)
			throw new Error(
				"privateKey required in server config to get wallet address.",
			);
		const { address } = createViemWalletClient(config.rpcUrl, config.privateKey);
		return { address };
	},
};
