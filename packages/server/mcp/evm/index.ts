import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Hex } from "viem";
import type { McpServerCreationConfig } from "../registry";
import registerEvmTools from "./tools/_registerTools";

export type EvmMcpConfig = {
	privateKey: Hex;
};

export default function (config: McpServerCreationConfig<EvmMcpConfig>) {
	const { name, ...restConfig } = config;

	const server = new McpServer({
		version: "0.0.1",
		name,
	});

	registerEvmTools({ server, ...restConfig });

	return server;
}
