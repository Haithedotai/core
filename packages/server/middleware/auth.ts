import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { jwtVerify, SignJWT } from "jose";
import { type Address, isAddress } from "viem";
import config from "../config";
import dbClient from "../lib/db/client";
import schema from "../lib/db/schema";
import { respond } from "../lib/utils/respond";

export const authenticated = createMiddleware<{
	Variables: {
		walletAddress: Address;
	};
}>(async (ctx, next) => {
	const accessToken = getCookie(ctx, config.jwtOptions.cookieNames.access);

	if (accessToken) {
		try {
			const { payload } = await jwtVerify(accessToken, config.jwtOptions.secret);
			const address = payload.sub;
			if (!address || !isAddress(address)) {
				return respond.err(ctx, "Invalid token", 401);
			}

			ctx.set("walletAddress", address);
			await next();
		} catch {
			return respond.err(ctx, "Invalid token", 401);
		}
	}

	const refreshToken = getCookie(ctx, config.jwtOptions.cookieNames.refresh);
	if (!refreshToken) return respond.err(ctx, "Unauthorized", 401);

	try {
		const { payload } = await jwtVerify(refreshToken, config.jwtOptions.secret);
		if (payload.type !== "refresh") throw new Error("Invalid refresh token");

		const address = payload.sub;
		if (!address || !isAddress(address)) {
			return respond.err(ctx, "Invalid token", 401);
		}

		const newAccessToken = await new SignJWT()
			.setSubject(address)
			.setIssuedAt()
			.setExpirationTime("15m")
			.setNotBefore("0s")
			.setProtectedHeader({ alg: config.jwtOptions.algorithm })
			.sign(config.jwtOptions.secret);

		setCookie(ctx, config.jwtOptions.cookieNames.access, newAccessToken, {
			...config.cookieOptions,
			maxAge: 60 * 15,
		});

		ctx.set("walletAddress", address);
		await next();
	} catch {
		return respond.err(ctx, "Unauthorized", 401);
	}

	console.log("If this is seen tell spandan");
	dbClient
		.update(schema.users)
		.set({
			lastActiveAt: new Date(),
		})
		.where(eq(schema.users.walletAddress, ctx.get("walletAddress")));
});
