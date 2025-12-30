import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";


import registerGetAllowance from "./getAllowance";
import registerGetBalance from "./getBalance";
import registerGetBlock from "./getBlock";
import registerGetErc1155Balance from "./getErc1155Balance";
import registerGetErc20Balance from "./getErc20Balance";
import registerGetErc20Decimals from "./getErc20Decimals";
import registerGetGasPrice from "./getGasPrice";
import registerGetLatestBlock from "./getLatestBlock";
import registerGetNativeBalance from "./getNativeBalance";
import registerGetNftInfo from "./getNftInfo";
import registerGetNftOwner from "./getNftOwner";
import registerGetOwnAddress from "./getOwnAddress";
import registerGetTokenMetadata from "./getTokenMetadata";
import registerGetTransaction from "./getTransaction";
import registerResolveEnsAddress from "./resolveEnsAddress";
import registerSignMessage from "./signMessage";
import registerSignRawBytes from "./signRawBytes";
import registerSignTypedData from "./signTypedData";
import registerTransferErc20 from "./transferErc20";
import registerWaitForAndGetTxnReceipt from "./waitForAndGetTxnReceipt";


export default function registerEvmTools(
	config: McpToolRegistrationConfig<EvmMcpConfig>,
) {
	registerGetAllowance(config);
	registerGetBalance(config);
	registerGetBlock(config);
	registerGetErc1155Balance(config);
	registerGetErc20Balance(config);
	registerGetErc20Decimals(config);
	registerGetGasPrice(config);
	registerGetLatestBlock(config);
	registerGetNativeBalance(config);
	registerGetNftInfo(config);
	registerGetNftOwner(config);
	registerGetOwnAddress(config);
	registerGetTokenMetadata(config);
	registerGetTransaction(config);
	registerResolveEnsAddress(config);
	registerSignMessage(config);
	registerSignRawBytes(config);
	registerSignTypedData(config);
	registerTransferErc20(config);
	registerWaitForAndGetTxnReceipt(config);
}
