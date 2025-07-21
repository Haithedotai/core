import { test, expect, describe, beforeEach } from "bun:test";
import * as viem from "viem";
import { hardhat } from "viem/chains";
import { HaitheClient } from "../interface";
import { privateKeyToAccount } from "viem/accounts";

// Hardhat private keys for testing
const pvtKey1 = "0x59c6995e998f97a5a0044976f1ebf041b8d6bc7d7db05d4e31c7d68cbe9b9d05";
const pvtKey2 = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";

// Local testing server
const baseUrl = "http://localhost:54125/api";

const walletClient = viem.createWalletClient({
    chain: hardhat,
    transport: viem.http(hardhat.rpcUrls.default.http[0]),
    account: privateKeyToAccount(pvtKey1)
}).extend(viem.publicActions);

const walletClient2 = viem.createWalletClient({
    chain: hardhat,
    transport: viem.http(hardhat.rpcUrls.default.http[0]),
    account: privateKeyToAccount(pvtKey2)
}).extend(viem.publicActions);

describe("API Key Management", () => {
    let client: HaitheClient;
    let client2: HaitheClient;

    beforeEach(async () => {
        client = new HaitheClient({
            walletClient,
            baseUrl,
            debug: true
        });
        
        client2 = new HaitheClient({
            walletClient: walletClient2,
            baseUrl,
            debug: true
        });

        // Login both clients
        await client.login();
        await client2.login();
        
        // Clean up any existing API keys
        try {
            await client.disableApiKey();
        } catch (e) {
            // Ignore error if no API key exists
        }
        try {
            await client2.disableApiKey();
        } catch (e) {
            // Ignore error if no API key exists
        }
    });

    describe("API Key Generation", () => {
        test("should generate API key successfully", async () => {
            const result = await client.generateApiKey();

            expect(result).toHaveProperty("api_key");
            expect(result).toHaveProperty("message");
            expect(result).toHaveProperty("issued_at");

            expect(result.api_key).toBeString();
            expect(result.api_key.length).toBeGreaterThan(0);
            
            expect(result.message).toBeString();
            expect(result.message).toContain(walletClient.account.address.toLowerCase());
            
            expect(result.issued_at).toBeNumber();
            expect(result.issued_at).toBeGreaterThan(0);
        });

        test("should fail to generate API key when already issued", async () => {
            // Generate first API key
            await client.generateApiKey();

            // Try to generate second API key
            expect(client.generateApiKey()).rejects.toThrow();
        });

        test("should generate different API keys for different users", async () => {
            const result1 = await client.generateApiKey();
            const result2 = await client2.generateApiKey();

            expect(result1.api_key).not.toBe(result2.api_key);
            expect(result1.message).not.toBe(result2.message);
            expect(result1.message).toContain(walletClient.account.address.toLowerCase());
            expect(result2.message).toContain(walletClient2.account.address.toLowerCase());
        });

        test("should fail to generate API key when not logged in", async () => {
            await client.logout();
            expect(client.generateApiKey()).rejects.toThrow("Not logged in");
        });
    });

    describe("API Key Disabling", () => {

        test("should allow generating new API key after disabling", async () => {
            // Generate API key
            const firstResult = await client.generateApiKey();

            // Disable it
            await client.disableApiKey();

            // Generate new API key
            const secondResult = await client.generateApiKey();

            expect(firstResult.api_key).not.toBe(secondResult.api_key);
            expect(firstResult.message).not.toBe(secondResult.message);
        });

        test("should fail to disable API key when not logged in", async () => {
            await client.logout();
            expect(client.disableApiKey()).rejects.toThrow("Not logged in");
        });
    });

    describe("API Key Workflow", () => {
        test("should handle complete generate -> disable -> generate cycle", async () => {
            // Generate first API key
            const firstKey = await client.generateApiKey();
            expect(firstKey.api_key).toBeString();

            // Should fail to generate another
            expect(client.generateApiKey()).rejects.toThrow();

            // Disable the key
            await client.disableApiKey();

            // Should be able to generate new key
            const secondKey = await client.generateApiKey();
            expect(secondKey.api_key).toBeString();
            expect(secondKey.api_key).not.toBe(firstKey.api_key);
        });

        test("should handle multiple disable calls", async () => {
            // Generate API key
            await client.generateApiKey();

            // Disable multiple times - should not error
            await client.disableApiKey();
            await client.disableApiKey();
            await client.disableApiKey();

            // Should still be able to generate new key
            const newKey = await client.generateApiKey();
            expect(newKey.api_key).toBeString();
        });
    });

    describe("API Key Message Format", () => {
        test("should generate message in T.A.N format", async () => {
            const result = await client.generateApiKey();
            const messageParts = result.message.split('.');

            expect(messageParts).toHaveLength(3);

            // T - timestamp
            const timestamp = parseInt(messageParts[0]);
            expect(timestamp).toBeNumber();
            expect(timestamp).toBeGreaterThan(0);
            expect(timestamp).toBe(result.issued_at);

            // A - address
            const address = messageParts[1];
            expect(address).toBe(walletClient.account.address.toLowerCase());

            // N - nonce (UUID format)
            const nonce = messageParts[2];
            expect(nonce).toBeString();
            expect(nonce.length).toBeGreaterThan(0);
            // Basic UUID format check (8-4-4-4-12 characters)
            expect(nonce).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
        });
    });
});