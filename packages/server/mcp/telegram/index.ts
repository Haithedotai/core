import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tryCatch } from "@haithe/shared";
import z from "zod";

export function getServer() {
    const server = new McpServer({
        name: "Tester",
        version: "0.0.1",
    })

    server.registerTool("post-to-telegram", {
        title: "Post to Telegram",
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: true,
            title: "Post to Telegram"
        },
        description: "Posts a message to the Telegram chat.",
        inputSchema: z.object({
            message: z.string()
        })
    }, async ({ message }) => {
        const response = await fetch(`https://api.telegram.org/bot${"8458065504:AAEi0E0LxqhsVUoIDwrIxFSVoasts_lb_WQ"}/sendMessage`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chat_id: 1196325945,
                text: message
            })
        });

        if (!response.ok) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to post message to Telegram: ${response.status} ${response.statusText}`
                    }
                ]
            };
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Message posted to Telegram chat.`
                }
            ]
        };
    })

    return server;
}
