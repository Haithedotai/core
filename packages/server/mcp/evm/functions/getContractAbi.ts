// mcp/evm/functions/getContractAbi.ts
import type { z } from "zod";
import { getContractAbiSchema } from "../schemas/getContractAbi.schema";

export const getContractAbi = {
	description: "Fetch a contract ABI from Etherscan API.",
	schema: getContractAbiSchema,
	run: async (config, input: z.infer<typeof getContractAbiSchema>) => {
		if (!input.etherscanApiKey) {
			throw new Error("etherscanApiKey is required for getContractAbi");
		}

		const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${input.contract}&apikey=${input.etherscanApiKey}`;

		const data = await fetch(url).then((r) => r.json());

		if (data.status !== "1") {
			return { success: false, error: data.result };
		}

		return { success: true, abi: JSON.parse(data.result) };
	},
};
