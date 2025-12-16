import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { SignJWT } from "jose";
import { isAddress } from "viem";
import {
	generateSiweNonce,
	parseSiweMessage,
	validateSiweMessage,
} from "viem/siwe";
import config from "../../config";
import { evmClient } from "../../lib/evm";
import { respond } from "../../lib/utils/respond";

const nonceManager = new Map<string, string>();

export default new Hono()

	.get("/nonce", async (ctx) => {
		const { address } = ctx.req.query();

		if (typeof address !== "string" || !isAddress(address)) {
			return respond.err(ctx, "Missing or invalid address", 400);
		}

		const nonce = generateSiweNonce();
		nonceManager.set(address, nonce);
		return respond.ok(ctx, { nonce }, "Generated SIWE nonce", 200);
	})

	.post("/login", async (ctx) => {
		const { message, signature, address } = await ctx.req.json();

		const nonce = nonceManager.get(address);
		nonceManager.delete(address);

		const parsed = parseSiweMessage(message);
		const valid = validateSiweMessage({ message: parsed, address, nonce });
		if (!valid) {
			return respond.err(ctx, "Invalid SIWE message", 400);
		}

		const verified = evmClient.verifySiweMessage({
			message,
			signature,
			address,
		});
		if (!verified) {
			return respond.err(ctx, "Invalid SIWE signature", 400);
		}

		const accessToken = await new SignJWT()
			.setSubject(address)
			.setIssuedAt()
			.setExpirationTime("15m")
			.setNotBefore("0s")
			.setProtectedHeader({ alg: config.jwtOptions.algorithm })
			.sign(config.jwtOptions.secret);

		const refreshToken = await new SignJWT({ type: "refresh" })
			.setSubject(address)
			.setIssuedAt()
			.setExpirationTime("7d")
			.setNotBefore("10m")
			.setProtectedHeader({ alg: config.jwtOptions.algorithm })
			.sign(config.jwtOptions.secret);

		setCookie(ctx, "access_token", accessToken, {
			...config.cookieOptions,
			maxAge: 60 * 15,
		});

		setCookie(ctx, "refresh_token", refreshToken, {
			...config.cookieOptions,
			path: "/auth/refresh",
			maxAge: 60 * 60 * 24 * 7,
		});
		return respond.ok(ctx, { address }, "Logged in successfully", 200);
	});
