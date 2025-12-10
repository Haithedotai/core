import { StreamableHTTPTransport } from "@hono/mcp";
import { Hono } from "hono";
import { getMcpServer } from "../../mcp/registry";

const mcpServer = getMcpServer("telegramBot", {
	botToken: "8458065504:AAEi0E0LxqhsVUoIDwrIxFSVoasts_lb_WQ",
	chatId: 1196325945,
});

const transport = new StreamableHTTPTransport();
mcpServer.connect(transport);

const app = new Hono()

	.get("/mcp", async (c) => {
		console.log(JSON.stringify(c.req.raw.headers));

		await transport.handleRequest(c);
		return c.text("OK");
	})

	.post("/mcp", async (c) => {
		transport.handleRequest(c);
		return c.text("OK");
	});

export default app;
