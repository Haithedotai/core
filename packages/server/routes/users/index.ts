import { eq } from "drizzle-orm";
import { Hono } from "hono";
import dbClient from "../../lib/db/client";
import schema from "../../lib/db/schema";
import { respond } from "../../lib/utils/respond";
import { authenticated } from "../../middleware/auth";

export default new Hono().get("/me", authenticated, async (ctx) => {
	const { walletAddress } = ctx.var;

	const [user] = await dbClient
		.select()
		.from(schema.users)
		.where(eq(schema.users.walletAddress, walletAddress))
		.limit(1);

	return respond.ok(ctx, { user }, "User retrieved successfully", 200);
});
