import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import telegramBot from "./telegramBot";
import { evmServer } from "./evm/server";

export const McpServerRegistry: Record<
    string,
    {
        name: string;
        configSchema: z.ZodType<object>;
        creationFn: (
            config: z.infer<z.ZodType<object>> & { name: string }
        ) => McpServer;
    }
> = {
    telegramBot: {
        name: "Telegram Bot MCP",
        configSchema: z.object({
            botToken: z.string().describe("The Telegram bot token."),
            chatId: z.string().describe("The Telegram chat ID to post messages to."),
        }),
        creationFn: telegramBot,
    },

    evm: {
        name: "EVM MCP",
        configSchema: z.object({
            rpcUrl: z.string().describe("RPC URL for EVM client."),
            privateKey: z.string().optional().describe("Private key for signing."),
        }),
        creationFn: evmServer,
    },
} as const;

export type McpServerName = keyof typeof McpServerRegistry;

export function getMcpServer(
    name: McpServerName,
    config: z.infer<(typeof McpServerRegistry)[McpServerName]["configSchema"]>
) {
    return McpServerRegistry[name].creationFn({ ...config, name });
}
