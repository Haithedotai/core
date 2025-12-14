import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import type { McpServerCreationConfig } from "../registry";
import { TelegramBot } from "./bot";

export default function (
	config: McpServerCreationConfig<{
		botToken: string;
		chatId: number;
	}>,
) {
	const { name, botToken, chatId } = config;

	const server = new McpServer({
		name,
		version: "0.0.1",
	});
	const bot = new TelegramBot(botToken, chatId);

	server.registerTool(
		"post-to-telegram",
		{
			title: "Post to Telegram",
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: false,
				openWorldHint: true,
				title: "Post to Telegram",
			},
			description: "Posts a message to the Telegram chat.",
			inputSchema: z.object({
				message: z.string().describe("The message to post to the Telegram chat."),
			}),
		},
		async ({ message }) => {
			const response = await bot.sendMessage({ message });

			if (!response.data.ok) {
				return {
					content: [
						{
							type: "text",
							text: `Failed to post message to Telegram: ${response.statusText}`,
						},
					],
				};
			}

			return {
				content: [
					{
						type: "text",
						text: `Message posted to Telegram chat.`,
					},
				],
			};
		},
	);

	return server;
}
