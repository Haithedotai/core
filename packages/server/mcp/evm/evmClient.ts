import { createWalletClient, createPublicClient, type Hex, http, publicActions } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { getChainDefinition, resolveViemChain } from "./chains";

export function createEvmClient(options: {
	chainId?: number;
	privateKey?: Hex;
}) {
	const { chainId, privateKey } = options;

	const chain = resolveViemChain(chainId ?? mainnet.id);
	const supportedChain = getChainDefinition(chainId ?? mainnet.id);
	if (!chain || !supportedChain) {
		throw new Error(`Unsupported chain ID: ${chainId}`);
	}

	return createWalletClient({
		account: privateKeyToAccount(privateKey ?? generatePrivateKey()),
		transport: http(supportedChain.rpcUrl()),
		chain,
	}).extend(publicActions);
}

export function createPublicEvmClient(options: {
	chainId?: number;
}) {
	const { chainId } = options;

	const chain = resolveViemChain(chainId ?? mainnet.id);
	const supportedChain = getChainDefinition(chainId ?? mainnet.id);
	if (!chain || !supportedChain) {
		throw new Error(`Unsupported chain ID: ${chainId}`);
	}

	return createPublicClient({
		transport: http(supportedChain.rpcUrl()),
		chain,
	});
}
