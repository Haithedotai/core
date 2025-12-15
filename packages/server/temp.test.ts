import { describe, expect, it } from "bun:test";
import axios from "axios";
import { createWalletClient, http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { createSiweMessage } from "viem/siwe";

const rpc = axios.create({
	baseURL: "http://localhost:4000",
	headers: {
		"Content-Type": "application/json",
	},
});

const wallet = createWalletClient({
	account: privateKeyToAccount(generatePrivateKey()),
	chain: mainnet,
	transport: http(),
});

describe("Sample Test Suite", () => {
	it("should pass a basic test", async () => {
		const { data: nonceResponse } = await rpc.get("/auth/nonce", {
			params: { address: wallet.account.address },
		});

		expect(nonceResponse.data.nonce).toBeDefined();

		const message = createSiweMessage({
			domain: "localhost",
			address: wallet.account.address,
			statement: "Sign in with Ethereum to the app.",
			uri: "http://localhost",
			version: "1",
			chainId: mainnet.id,
			nonce: nonceResponse.data.nonce,
		});

		const signature = await wallet.account.signMessage({ message });

		const response = await rpc.post("/auth/login", {
			message,
			address: wallet.account.address,
			signature,
		});

		console.log(response);
	});
});
