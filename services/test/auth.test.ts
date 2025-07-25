import { test, expect, describe, beforeEach } from "bun:test";
import * as viem from "viem";
import { hardhat } from "viem/chains";
import { HaitheClient } from "../interface";
import { privateKeyToAccount } from "viem/accounts";

// Hardhat private keys for testing
const pvtKey1 =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const pvtKey2 =
  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";

// Local testing server
const baseUrl = "http://localhost:54125/api";

const walletClient = viem
  .createWalletClient({
    chain: hardhat,
    transport: viem.http(hardhat.rpcUrls.default.http[0]),
    account: privateKeyToAccount(pvtKey1),
  })
  .extend(viem.publicActions);

const walletClient2 = viem
  .createWalletClient({
    chain: hardhat,
    transport: viem.http(hardhat.rpcUrls.default.http[0]),
    account: privateKeyToAccount(pvtKey2),
  })
  .extend(viem.publicActions);

describe("Authentication via HaitheClient", () => {
  let client: HaitheClient;

  beforeEach(() => {
    client = new HaitheClient({
      walletClient,
      baseUrl,
      debug: true,
    });
  });

  describe("Web3 Readiness", () => {
    test("should check if web3 is ready", () => {
      expect(client.isWeb3Ready()).toBe(true);
    });

    test("should detect invalid wallet client", () => {
      const invalidClient = {} as any;
      expect(HaitheClient.ensureWeb3Ready(invalidClient)).toBe(false);
    });

    test("should detect valid wallet client", () => {
      expect(HaitheClient.ensureWeb3Ready(walletClient)).toBe(true);
    });
  });

  describe("Authentication Flow", () => {
    test("should start logged out", () => {
      expect(client.isLoggedIn()).toBe(false);
      expect(client.getAuthToken()).toBeNull();
    });

    test("should login successfully", async () => {
      await client.login();

      expect(client.isLoggedIn()).toBe(true);
      expect(client.getAuthToken()).toBeString();
      expect(client.getAuthToken()?.length).toBeGreaterThan(0);
    });

    test("should get user profile after login", async () => {
      await client.login();

      const profile = await client.profile();
      expect(profile.address).toBe(walletClient.account.address.toLowerCase());
    });

    test("should logout successfully", async () => {
      await client.login();
      expect(client.isLoggedIn()).toBe(true);

      await client.logout();
      expect(client.isLoggedIn()).toBe(false);
      expect(client.getAuthToken()).toBeNull();
    });

    test("should throw error when logging out without login", async () => {
      expect(client.logout()).rejects.toThrow("Not logged in");
    });
  });

  describe("API Key Management", () => {
    beforeEach(async () => {
      await client.login();
      try {
        await client.disableApiKey();
      } catch (e) {}
    });

    test("should generate API key when logged in", async () => {
      const result = await client.generateApiKey();

      expect(result).toHaveProperty("api_key");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("issued_at");
      expect(result.api_key).toBeString();
    });

    test("should disable API key when logged in", async () => {
      await client.generateApiKey();
      await client.disableApiKey();
      await client.generateApiKey();
    });

    test("should throw error when generating API key without login", async () => {
      await client.logout();
      expect(client.generateApiKey()).rejects.toThrow("Not logged in");
    });

    test("should throw error when disabling API key without login", async () => {
      await client.logout();
      expect(client.disableApiKey()).rejects.toThrow("Not logged in");
    });
  });

  describe("Multiple Users", () => {
    test("should handle different wallet addresses", async () => {
      const client2 = new HaitheClient({
        walletClient: walletClient2,
        baseUrl,
        debug: true,
      });

      await client.login();
      await client2.login();

      const profile1 = await client.profile();
      const profile2 = await client2.profile();

      expect(profile1.address).toBe(walletClient.account.address.toLowerCase());
      expect(profile2.address).toBe(
        walletClient2.account.address.toLowerCase()
      );
      expect(profile1.address).not.toBe(profile2.address);
    });
  });

  describe("Error Handling", () => {
    test("should throw error for invalid wallet client", async () => {
      const invalidClient = new HaitheClient({
        walletClient: {} as any,
        baseUrl,
        debug: true,
      });

      expect(invalidClient.login()).rejects.toThrow(
        "Wallet client is not ready"
      );
    });
  });
});
