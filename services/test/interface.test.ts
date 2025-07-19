import { test, expect, mock, describe, beforeEach } from "bun:test";
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



describe("Organizations", () => {
  let client: HaitheClient;
  let orgId: number;

  beforeEach(async () => {
    client = new HaitheClient({ walletClient, baseUrl, debug: true });
    await client.login();
  });

  test("create organization", async () => {
    const orgName = `Test Org ${Date.now()}`;
    const org = await client.createOrganization(orgName);

    expect(org.name).toBe(orgName);
    expect(org.owner).toBe(walletClient.account.address.toLowerCase());
    expect(typeof org.id).toBe("number");
    expect(typeof org.created_at).toBe("string");

    orgId = org.id;
  });

  test("get organization", async () => {
    const orgName = `Test Org ${Date.now()}`;
    const createdOrg = await client.createOrganization(orgName);

    const org = await client.getOrganization(createdOrg.id);
    expect(org.id).toBe(createdOrg.id);
    expect(org.name).toBe(orgName);
    expect(org.owner).toBe(walletClient.account.address.toLowerCase());
  });


  test("update organization", async () => {
    const orgName = `Test Org ${Date.now()}`;
    const createdOrg = await client.createOrganization(orgName);

    const newName = `Updated Org ${Date.now()}`;
    const updatedOrg = await client.updateOrganization(createdOrg.id, newName);

    expect(updatedOrg.id).toBe(createdOrg.id);
    expect(updatedOrg.name).toBe(newName);
    expect(updatedOrg.owner).toBe(walletClient.account.address.toLowerCase());
  });

  test("delete organization", async () => {
    const orgName = `Test Org ${Date.now()}`;
    const createdOrg = await client.createOrganization(orgName);

    expect(
      await client.deleteOrganization(createdOrg.id)
    ).rejects.toThrow();


  });
});