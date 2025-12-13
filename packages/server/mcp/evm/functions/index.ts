// mcp/evm/functions/index.ts
import { getWalletAddress } from "./getWalletAddress";
import { getChainInfo } from "./getChainInfo";
import { getSupportedNetworks } from "./getSupportedNetworks";
import { getGasPrice } from "./getGasPrice";
import { resolveEnsName } from "./resolveEnsName";
import { lookupEnsAddress } from "./lookupEnsAddress";
import { getBlock } from "./getBlock";
import { getLatestBlock } from "./getLatestBlock";
import { getBalance } from "./getBalance";
import { getTokenBalance } from "./getTokenBalance";
import { getAllowance } from "./getAllowance";
import { getTransaction } from "./getTransaction";
import { getTransactionReceipt } from "./getTransactionReceipt";
import { waitForTransaction } from "./waitForTransaction";
import { getContractAbi } from "./getContractAbi";
import { readContract } from "./readContract";
import { writeContract } from "./writeContract";
import { multicall } from "./multicall";
import { transferNative } from "./transferNative";
import { transferErc20 } from "./transferErc20";
import { approveTokenSpending } from "./approveTokenSpending";
import { getNftInfo } from "./getNftInfo";
import { getErc1155Balance } from "./getErc1155Balance";
import { signMessage } from "./signMessage";
import { signTypedData } from "./signTypedData";
import { getNftOwner } from "./getNftOwner";
import { getTokenMetadata } from "./getTokenMetadata";
import { getContractInterfaces } from "./getContractInterfaces";

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
