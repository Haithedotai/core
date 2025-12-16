import { eq } from "drizzle-orm";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { jwtVerify } from "jose";
import { type Address, isAddress } from "viem";
import config from "../config";
import dbClient from "../lib/db/client";
import schema from "../lib/db/schema";

export const authenticated = createMiddleware<{
	Variables: {
		walletAddress: Address;
	};
}>(async (ctx, next) => {
	const token = getCookie(ctx, "access_token");
	if (!token) return ctx.json({ error: "Unauthorized" }, 401);

	try {
		const { payload } = await jwtVerify(token, config.jwtOptions.secret);
		const address = payload.sub;
		if (!isAddress(address)) {
			return ctx.json({ error: "Invalid token" }, 401);
		}

		ctx.set("walletAddress", address);
		await next();
	} catch {
		return ctx.json({ error: "Invalid token" }, 401);
	}

	await dbClient
		.update(schema.users)
		.set({
			lastActiveAt: new Date(),
		})
		.where(eq(schema.users.walletAddress, ctx.get("walletAddress")));
});
