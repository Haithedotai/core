// mcp/evm/functions/resolveEnsName.ts
import type { z } from "zod";
import { createViemPublicClient } from "../evmClient";
import { resolveEnsNameSchema } from "../schemas/resolveEnsName.schema";

export const resolveEnsName = {
	description: "Resolves an ENS name to an Ethereum address.",
	schema: resolveEnsNameSchema,
	run: async (config, input: z.infer<typeof resolveEnsNameSchema>) => {
		const client = createViemPublicClient(config.rpcUrl);

		const address = await client.getEnsAddress({ name: input.ens });

		return {
			ens: input.ens,
			address: address ?? null,
			resolved: !!address,
		};
	},
};
