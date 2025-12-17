import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./auth";
import mcpRoutes from "./mcp";
import usersRoutes from "./users";

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

	.route("/auth", authRoutes)
	.route("/mcp", mcpRoutes)
	.route("/users", usersRoutes);

export default app;
