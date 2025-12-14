// mcp/evm/functions/multicall.ts
import type { z } from "zod";
import { multicallSchema } from "../schemas/multicall.schema";
import { createViemPublicClient } from "../viemClient";

export const multicall = {
	description: "Runs multiple read calls in a single RPC request.",
	schema: multicallSchema,
	run: async (config, input: z.infer<typeof multicallSchema>) => {
		const client = createViemPublicClient(config.rpcUrl);

		const params: any = {
			contracts: input.calls.map((c) => ({
				address: c.address as `0x${string}`,
				abi: c.abi,
				functionName: c.functionName,
				args: c.args ?? [],
			})),
			authorizationList: [],
			allowFailure: true,
		};

		const result = await client.multicall(params);

		return { results: result };
	},
};
