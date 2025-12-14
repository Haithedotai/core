// mcp/evm/functions/getGasPrice.ts
import { createViemPublicClient } from "../viemClient";

export const getGasPrice = {
	description: "Returns current baseFee & priorityFee.",
	schema: undefined,
	run: async (config) => {
		const client = createViemPublicClient(config.rpcUrl);

		const gasPrice = await client.getGasPrice();
		const feeData = await client.estimateFeesPerGas();

		return {
			gasPrice: gasPrice.toString(),
			maxFeePerGas: feeData.maxFeePerGas?.toString() ?? null,
			maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() ?? null,
		};
	},
};
