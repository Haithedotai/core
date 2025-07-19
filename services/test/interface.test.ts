import { test, expect, mock, describe } from "bun:test";
import * as viem from "viem";
import { hardhat } from "viem/chains"
import { HaitheClient } from "../interface";
import { privateKeyToAccount } from "viem/accounts";

// Hardhat private keys for testing
const pvtKey1 = "0x59c6995e998f97a5a0044976f1ebf041b8d6bc7d7db05d4e31c7d68cbe9b9d05"
const pvtKey2 = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
// Local testing server
const baseUrl = "http://localhost:54125/api"

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


describe("Authentication", () => {
  test("login", async () => {
    const client = new HaitheClient({ walletClient, baseUrl, debug: true });
    await client.login();
    expect(client.isLoggedIn()).toBe(true);
  })

  test("logout", async () => {
    const client = new HaitheClient({ walletClient, baseUrl, debug: true });
    await client.login();
    await client.logout();
    expect(client.isLoggedIn()).toBe(false);
  });

  test("profile", async () => {
    const client = new HaitheClient({ walletClient, baseUrl, debug: true });
    await client.login();

    const profile = await client.profile();
    expect(profile.address).toBe(walletClient.account.address.toLowerCase());
  });
});
