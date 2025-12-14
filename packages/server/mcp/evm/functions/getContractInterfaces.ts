// mcp/evm/functions/getContractInterfaces.ts
import type { z } from "zod";
import { createViemPublicClient } from "../evmClient";
import { getContractInterfacesSchema } from "../schemas/getContractInterfaces.schema";

const ERC165_ABI = [
	{
		name: "supportsInterface",
		type: "function",
		stateMutability: "view",
		inputs: [{ name: "interfaceId", type: "bytes4" }],
		outputs: [{ type: "bool" }],
	},
];

const INTERFACES = {
	ERC165: "0x01ffc9a7",
	ERC20: "0x36372b07",
	ERC721: "0x80ac58cd",
	ERC721_METADATA: "0x5b5e139f",
	ERC721_ENUMERABLE: "0x780e9d63",
	ERC1155: "0xd9b67a26",
	ERC1155_METADATA: "0x0e89341c",
};

export const getContractInterfaces = {
	description: "Detects what interfaces a contract supports via ERC165.",
	schema: getContractInterfacesSchema,
	run: async (config, input: z.infer<typeof getContractInterfacesSchema>) => {
		const client = createViemPublicClient(config.rpcUrl);

		const checked: Record<string, boolean> = {};

		for (const [name, iface] of Object.entries(INTERFACES)) {
			try {
				const supported = await client.readContract({
					address: input.contract as `0x${string}`,
					abi: ERC165_ABI,
					functionName: "supportsInterface",
					args: [iface as `0x${string}`],
					authorizationList: [],
				});

				checked[name] = Boolean(supported);
			} catch {
				checked[name] = false;
			}
		}

		return {
			contract: input.contract,
			interfaces: checked,
		};
	},
};
