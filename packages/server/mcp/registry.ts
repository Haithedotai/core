import z from "zod";
import telegramBot from "./telegramBot";

export const McpServerRegistry = {
	telegramBot: {
		name: "Telegram Bot MCP",
		configSchema: z.object({
			botToken: z.string().describe("The Telegram bot token."),
			chatId: z.number().describe("The Telegram chat ID to post messages to."),
		}),
		creationFn: telegramBot,
	},
} as const;

export type McpServerName = keyof typeof McpServerRegistry;

export function getMcpServer(
	name: McpServerName,
	config: z.infer<(typeof McpServerRegistry)[McpServerName]["configSchema"]>,
) {
	const server = McpServerRegistry[name].creationFn({ ...config, name });
	return server;
}
