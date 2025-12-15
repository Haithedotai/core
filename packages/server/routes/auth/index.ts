import { Hono } from "hono";
import { isAddress } from "viem";
import {
	generateSiweNonce,
	parseSiweMessage,
	validateSiweMessage,
} from "viem/siwe";
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

		return respond.ok(ctx, { address }, "Logged in successfully", 200);
	});
