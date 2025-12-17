// index.test.ts

import { describe, expect, it } from "bun:test";
import { testClient } from "hono/testing";
import { createWalletClient, http } from "viem";
import { createSiweMessage } from "viem/siwe";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import app from "./routes/router";

const evmWallet = createWalletClient({
	transport: http(),
	chain: hardhat,
	account: privateKeyToAccount(
		"0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
	),
});

const client = testClient(app);
describe("Auth Flow", () => {
	let nonce: string;

	it("should return 400 for missing address", async () => {
		const res = await client.auth.nonce.$get({
			query: { address: "" },
		});
		expect(res.status).toBe(400);
	});

	it("should return nonce for valid address", async () => {
		const address = evmWallet.account.address;
		const res = await client.auth.nonce.$get({
			query: { address },
		});
		expect(res.status).toBe(200);

		const responseRaw = await res.json();

		expect(responseRaw.success).toBe(true);
		if (!responseRaw.success) throw new Error("Response unsuccessful");
		nonce = responseRaw.data.nonce;
		expect(nonce).toBeDefined();
	});

	it("should authenticate with valid signature", async () => {
		const address = evmWallet.account.address;
		const message = createSiweMessage({
			nonce,
			address,
			chainId: hardhat.id,
			version: "1",
			domain: "localhost",
			uri: "http://localhost",
		});
		const signature = await evmWallet.signMessage({ message });

		const res = await client.auth.login.$post({
			json: {
				address,
				message,
				signature,
			},
		});

		expect(res.status).toBe(200);
	});
});
