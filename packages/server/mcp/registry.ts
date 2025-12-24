import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import evmMcp from "./evm";
import telegramBotMcp from "./telegramBot";

export const McpServerRegistry = {
	telegramBot: {
		name: "Telegram Bot MCP",
		configSchema: z.object({
			botToken: z.string().describe("The Telegram bot token."),
			chatId: z.number().describe("The Telegram chat ID to post messages to."),
		}),
		creationFn: telegramBotMcp,
	},

	evm: {
		name: "EVM MCP",
		configSchema: z.object({
			privateKey: z.string().describe("Private key for signing."),
		}),
		creationFn: evmMcp,
	},
} as const;

export type McpServerName = keyof typeof McpServerRegistry;
export type McpServerCreationConfig<T extends object> = { name: string } & T;
export type McpToolRegistrationConfig<T extends object> = {
	server: McpServer;
} & T;

export function getMcpServer<N extends McpServerName>(
	name: N,
	config: z.infer<(typeof McpServerRegistry)[N]["configSchema"]>,
) {
	const entry = McpServerRegistry[name];
	// @ts-expect-error - Complex generic type that TypeScript can't infer properly
	return entry.creationFn({ ...config, name });
}
