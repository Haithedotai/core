import type { McpToolRegistrationConfig } from "../../registry";
import type { EvmMcpConfig } from "..";

import registerGetBalance from "./getBalance";
import registerSignMessage from "./signMessage";
import registerSignRawBytes from "./signRawBytes";
import registerTransferErc20 from "./transferErc20";

export default function registerEvmTools(
	config: McpToolRegistrationConfig<EvmMcpConfig>,
) {
	registerGetBalance(config);
	registerSignMessage(config);
	registerSignRawBytes(config);
	registerTransferErc20(config);
}
