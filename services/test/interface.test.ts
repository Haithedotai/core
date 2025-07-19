import { test, expect, mock, beforeEach, afterEach } from "bun:test";
import * as viem from "viem";
import { hardhat } from "viem/chains"
import { HaitheClient } from "../interface";
import { privateKeyToAccount } from "viem/accounts";

// Hardhat private key 
const pvtKey = "0x59c6995e998f97a5a0044976f1ebf041b8d6bc7d7db05d4e31c7d68cbe9b9d05"
// Local testing server
const baseUrl = "http://localhost:54125/api"

const walletClient = viem.createWalletClient({
  chain: hardhat,
  transport: viem.http(hardhat.rpcUrls.default.http[0]),
  account: privateKeyToAccount(pvtKey)
}).extend(viem.publicActions);

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

