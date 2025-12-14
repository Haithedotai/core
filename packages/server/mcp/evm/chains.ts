import type { Chain } from "viem";
import viemChains from "viem/chains";

export const supportedChains: ChainDefinition[] = [
	{
		name: "Ethereum",
		chainId: 1,
		rpcUrl: () => `https://eth.merkle.io`,
	},
	{
		name: "Binance Smart Chain",
		chainId: 56,
		rpcUrl: () => `https://56.rpc.thirdweb.com/`,
	},
	{
		name: "Polygon",
		chainId: 137,
		rpcUrl: () => `https://polygon-rpc.com/`,
	},
];

export function getChainDefinition(
	chainId: number,
): ChainDefinition | undefined {
	return supportedChains.find((chain) => chain.chainId === chainId);
}

export function resolveViemChain(chainId: number): Chain | undefined {
	const chains = Object.values(viemChains);
	return chains.find((chain) => chain.id === chainId);
}

type ChainDefinition = {
	name: string;
	chainId: number;
	rpcUrl: () => string;
};
