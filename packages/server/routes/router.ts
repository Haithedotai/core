import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import mcpRoutes from "./mcp";

const app = new Hono()
	.use(logger())
	.use(
		cors({
			origin: ["*"],
			allowHeaders: ["Content-Type", "Authorization"],
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			credentials: true,
		}),
	)

	.route("/mcp", mcpRoutes);

export default {
	port: 3000,
	fetch: app.fetch,
};
