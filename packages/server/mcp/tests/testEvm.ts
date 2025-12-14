import { evmFunctions } from "../evm/functions/index.js";

async function main() {
	const config = {
		name: "evm",
		rpcUrl: "https://ethereum.publicnode.com",
		privateKey:
			"0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
	};

	console.log("Running direct EVM MCP test...\n");

	const tool = evmFunctions.getBalance;

	const result = await tool.run(config, {
		address: "0x0000000000000000000000000000000000000000",
	});

	console.log("Result:", result);
}

main();
