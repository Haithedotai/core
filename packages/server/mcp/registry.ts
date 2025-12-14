import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import z from "zod";
import evmMcp from "./evm";
import telegramBotMcp from "./telegramBot";

export const McpServerRegistry: Record<
	string,
	{
		name: string;
		configSchema: z.ZodType<object>;
		creationFn: (
			config: z.infer<z.ZodType<object>> & { name: string },
		) => McpServer;
	}
> = {
	telegramBot: {
		name: "Telegram Bot MCP",
		configSchema: z.object({
			botToken: z.string().describe("The Telegram bot token."),
			chatId: z.string().describe("The Telegram chat ID to post messages to."),
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

export function getMcpServer(
	name: McpServerName,
	config: z.infer<(typeof McpServerRegistry)[McpServerName]["configSchema"]>,
) {
	return McpServerRegistry[name].creationFn({ ...config, name });
}
