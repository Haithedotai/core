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

	.get("/", async (c) => {
		console.log("GET HEADERS : ", JSON.stringify(c.req.raw.headers));

		await transport.handleRequest(c);
		return c.text("OK");
	})

	.post("/", async (c) => {
		console.log("POST HEADERS : ", JSON.stringify(c.req.raw.headers));

		await transport.handleRequest(c);
		return c.text("OK");
	});

export default app;
