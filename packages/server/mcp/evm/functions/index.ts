// mcp/evm/functions/index.ts

import { approveTokenSpending } from "./approveTokenSpending";
import { getAllowance } from "./getAllowance";
import { getBalance } from "./getBalance";
import { getBlock } from "./getBlock";
import { getChainInfo } from "./getChainInfo";
import { getContractAbi } from "./getContractAbi";
import { getContractInterfaces } from "./getContractInterfaces";
import { getErc1155Balance } from "./getErc1155Balance";
import { getGasPrice } from "./getGasPrice";
import { getLatestBlock } from "./getLatestBlock";
import { getNftInfo } from "./getNftInfo";
import { getNftOwner } from "./getNftOwner";
import { getSupportedNetworks } from "./getSupportedNetworks";
import { getTokenBalance } from "./getTokenBalance";
import { getTokenMetadata } from "./getTokenMetadata";
import { getTransaction } from "./getTransaction";
import { getTransactionReceipt } from "./getTransactionReceipt";
import { getWalletAddress } from "./getWalletAddress";
import { lookupEnsAddress } from "./lookupEnsAddress";
import { multicall } from "./multicall";
import { readContract } from "./readContract";
import { resolveEnsName } from "./resolveEnsName";
import { signMessage } from "./signMessage";
import { signTypedData } from "./signTypedData";
import { transferErc20 } from "./transferErc20";
import { transferNative } from "./transferNative";
import { waitForTransaction } from "./waitForTransaction";
import { writeContract } from "./writeContract";

export const evmFunctions = {
	getWalletAddress,
	getChainInfo,
	getSupportedNetworks,
	getGasPrice,
	resolveEnsName,
	lookupEnsAddress,
	getBlock,
	getLatestBlock,
	getBalance,
	getTokenBalance,
	getAllowance,
	getTransaction,
	getTransactionReceipt,
	waitForTransaction,
	getContractAbi,
	readContract,
	writeContract,
	multicall,
	transferNative,
	transferErc20,
	approveTokenSpending,
	getNftInfo,
	getErc1155Balance,
	signMessage,
	signTypedData,
	getNftOwner,
	getTokenMetadata,
	getContractInterfaces,
} as const;
