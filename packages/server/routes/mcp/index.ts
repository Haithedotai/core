import { StreamableHTTPTransport } from "@hono/mcp";
import { Hono } from "hono";
import { getMcpServer } from "../../mcp/registry";

const mcpServer = getMcpServer("evm", {
	privateKey:
		"0x67bb0d5f28e5d7d927872063a3f2970160202fffa77e7bd5eb871368abfd75d6",
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
