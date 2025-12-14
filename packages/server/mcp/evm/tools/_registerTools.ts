import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";

import registerGetBalance from "./getBalance";
import registerGetErc20Balance from "./getErc20Balance";
import registerGetErc20Decimals from "./getErc20Decimals";
import registerSignMessage from "./signMessage";
import registerSignRawBytes from "./signRawBytes";
import registerTransferErc20 from "./transferErc20";

export default function registerEvmTools(
	config: McpToolRegistrationConfig<EvmMcpConfig>,
) {
	registerGetBalance(config);
	registerGetErc20Balance(config);
	registerGetErc20Decimals(config);
	registerSignMessage(config);
	registerSignRawBytes(config);
	registerTransferErc20(config);
}
