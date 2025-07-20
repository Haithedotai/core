import { test, expect, describe, beforeEach } from "bun:test";
import * as viem from "viem";
import { hardhat } from "viem/chains";
import { HaitheClient } from "../interface";
import { privateKeyToAccount } from "viem/accounts";

// Hardhat private keys for testing
const pvtKey1 = "0x59c6995e998f97a5a0044976f1ebf041b8d6bc7d7db05d4e31c7d68cbe9b9d05";
const pvtKey2 = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
const pvtKey3 = "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a";

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

const walletClient3 = viem.createWalletClient({
  chain: hardhat,
  transport: viem.http(hardhat.rpcUrls.default.http[0]),
  account: privateKeyToAccount(pvtKey3)
}).extend(viem.publicActions);

describe("Organizations via HaitheClient", () => {
  let client: HaitheClient;
  let client2: HaitheClient;
  let client3: HaitheClient;

  beforeEach(async () => {
    // Setup clients
    client = new HaitheClient({ walletClient, baseUrl, debug: true });
    client2 = new HaitheClient({ walletClient: walletClient2, baseUrl, debug: true });
    client3 = new HaitheClient({ walletClient: walletClient3, baseUrl, debug: true });
    
    // Login all users
    await client.login();
    await client2.login();
    await client3.login();
  });

  describe("Organization CRUD Operations (Direct Methods)", () => {
    test("should create organization", async () => {
      const orgName = `Test Org ${Date.now()}`;
      const org = await client.createOrganization(orgName);

      expect(org.name).toBe(orgName);
      expect(org.owner).toBe(walletClient.account.address.toLowerCase());
      expect(typeof org.id).toBe("number");
      expect(typeof org.created_at).toBe("string");
    });

    test("should get organization", async () => {
      const orgName = `Test Org ${Date.now()}`;
      const createdOrg = await client.createOrganization(orgName);

      const org = await client.getOrganization(createdOrg.id);
      
      expect(org.id).toBe(createdOrg.id);
      expect(org.name).toBe(orgName);
      expect(org.owner).toBe(walletClient.account.address.toLowerCase());
    });

    test("should update organization", async () => {
      const orgName = `Test Org ${Date.now()}`;
      const createdOrg = await client.createOrganization(orgName);

      const newName = `Updated Org ${Date.now()}`;
      const updatedOrg = await client.updateOrganization(createdOrg.id, newName);

      expect(updatedOrg.id).toBe(createdOrg.id);
      expect(updatedOrg.name).toBe(newName);
      expect(updatedOrg.owner).toBe(walletClient.account.address.toLowerCase());
    });

    test("should delete organization", async () => {
      const orgName = `Test Org ${Date.now()}`;
      const createdOrg = await client.createOrganization(orgName);

      const deletedOrg = await client.deleteOrganization(createdOrg.id);

      expect(deletedOrg.id).toBe(createdOrg.id);
      expect(deletedOrg.name).toBe(orgName);
      expect(deletedOrg.owner).toBe(walletClient.account.address.toLowerCase());
    });
  });


  describe("Organization Members Management", () => {
    let orgId: number;

    beforeEach(async () => {
      const orgName = `Test Org ${Date.now()}`;
      const org = await client.createOrganization(orgName);
      orgId = org.id;
    });

    test("should get empty member list initially", async () => {
      const members = await client.getOrganizationMembers(orgId);
      
      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBe(0);
    });

    test("should add organization member", async () => {
      const walletAddress = walletClient2.account.address;
      const role = "member";

      const member = await client.addOrganizationMember(orgId, walletAddress, role);

      expect(member.org_id).toBe(orgId);
      expect(member.wallet_address).toBe(walletAddress.toLowerCase());
      expect(member.role).toBe(role);
      expect(typeof member.created_at).toBe("string");
    });

    test("should update organization member role", async () => {
      const walletAddress = walletClient2.account.address;

      await client.addOrganizationMember(orgId, walletAddress, "member");
      const updatedMember = await client.updateOrganizationMemberRole(orgId, walletAddress, "admin");

      expect(updatedMember.org_id).toBe(orgId);
      expect(updatedMember.wallet_address).toBe(walletAddress.toLowerCase());
      expect(updatedMember.role).toBe("admin");
      expect(typeof updatedMember.created_at).toBe("string");
    });

    test("should remove organization member", async () => {
      const walletAddress = walletClient2.account.address;

      await client.addOrganizationMember(orgId, walletAddress, "member");
      const removedMember = await client.removeOrganizationMember(orgId, walletAddress);

      expect(removedMember.org_id).toBe(orgId);
      expect(removedMember.wallet_address).toBe(walletAddress.toLowerCase());
      expect(removedMember.role).toBe("member");

      const members = await client.getOrganizationMembers(orgId);
      expect(members.length).toBe(0);
    });
  });


  describe("Permission Management", () => {
    let orgId: number;

    beforeEach(async () => {
      const orgName = `Test Org ${Date.now()}`;
      const org = await client.createOrganization(orgName);
      orgId = org.id;
    });

    test("non-owner cannot add members", async () => {
      const walletAddress = walletClient.account.address;

      expect(
        client2.addOrganizationMember(orgId, walletAddress, "member")
      ).rejects.toThrow();
    });

    test("non-owner cannot update member roles", async () => {
      const walletAddress = walletClient2.account.address;

      await client.addOrganizationMember(orgId, walletAddress, "member");

      await expect(
        client2.updateOrganizationMemberRole(orgId, walletAddress, "admin")
      ).rejects.toThrow();
    });

    test("non-owner cannot remove members", async () => {
      const walletAddress = walletClient2.account.address;

      await client.addOrganizationMember(orgId, walletAddress, "member");

      await expect(
        client2.removeOrganizationMember(orgId, walletAddress)
      ).rejects.toThrow();
    });

    test("admin can add members", async () => {
      const walletAddress = walletClient2.account.address;
      const thirdWalletAddress = walletClient3.account.address;

      await client.addOrganizationMember(orgId, walletAddress, "admin");

      const member = await client2.addOrganizationMember(orgId, thirdWalletAddress, "member");

      expect(member.org_id).toBe(orgId);
      expect(member.wallet_address).toBe(thirdWalletAddress.toLowerCase());
      expect(member.role).toBe("member");
    });

    test("admin can update member roles", async () => {
      const walletAddress = walletClient2.account.address;
      const thirdWalletAddress = walletClient3.account.address;

      await client.addOrganizationMember(orgId, walletAddress, "admin");
      await client.addOrganizationMember(orgId, thirdWalletAddress, "member");

      const updatedMember = await client2.updateOrganizationMemberRole(orgId, thirdWalletAddress, "admin");

      expect(updatedMember.role).toBe("admin");
    });

    test("admin can remove members", async () => {
      const walletAddress = walletClient2.account.address;
      const thirdWalletAddress = walletClient3.account.address;

      await client.addOrganizationMember(orgId, walletAddress, "admin");
      await client.addOrganizationMember(orgId, thirdWalletAddress, "member");

      const removedMember = await client2.removeOrganizationMember(orgId, thirdWalletAddress);

      expect(removedMember.wallet_address).toBe(thirdWalletAddress.toLowerCase());

      const members = await client.getOrganizationMembers(orgId);
      expect(members.length).toBe(1);
      expect(members[0].wallet_address).toBe(walletAddress.toLowerCase());
    });

  });

});