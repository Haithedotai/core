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
const pvtKey3 =
  "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a";

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

const walletClient3 = viem
  .createWalletClient({
    chain: hardhat,
    transport: viem.http(hardhat.rpcUrls.default.http[0]),
    account: privateKeyToAccount(pvtKey3),
  })
  .extend(viem.publicActions);

describe("Projects via HaitheClient", () => {
  let client: HaitheClient;
  let client2: HaitheClient;
  let client3: HaitheClient;
  let orgId: number;

  beforeEach(async () => {
    // Setup clients
    client = new HaitheClient({ walletClient, baseUrl, debug: true });
    client2 = new HaitheClient({
      walletClient: walletClient2,
      baseUrl,
      debug: true,
    });
    client3 = new HaitheClient({
      walletClient: walletClient3,
      baseUrl,
      debug: true,
    });

    // Login all users
    await client.login();
    await client2.login();
    await client3.login();

    // Create organization for testing projects
    const orgName = `Test Org ${Date.now()}`;
    const org = await client.createOrganization(orgName);
    orgId = org.id;
  });

  describe("Project CRUD Operations", () => {
    test("should create project", async () => {
      const projectName = `Test Project ${Date.now()}`;
      const project = await client.createProject(orgId, projectName);

      expect(project.name).toBe(projectName);
      expect(project.org_id).toBe(orgId);
      expect(typeof project.id).toBe("number");
      expect(typeof project.created_at).toBe("string");
    });

    test("should get project", async () => {
      const projectName = `Test Project ${Date.now()}`;
      const createdProject = await client.createProject(orgId, projectName);

      const project = await client.getProject(createdProject.id);

      expect(project.id).toBe(createdProject.id);
      expect(project.name).toBe(projectName);
      expect(project.org_id).toBe(orgId);
    });

    test("should update project", async () => {
      const projectName = `Test Project ${Date.now()}`;
      const createdProject = await client.createProject(orgId, projectName);

      const newName = `Updated Project ${Date.now()}`;
      const updatedProject = await client.updateProject(
        createdProject.id,
        newName
      );

      expect(updatedProject.id).toBe(createdProject.id);
      expect(updatedProject.name).toBe(newName);
      expect(updatedProject.org_id).toBe(orgId);
    });

    test("should delete project", async () => {
      const projectName = `Test Project ${Date.now()}`;
      const createdProject = await client.createProject(orgId, projectName);

      const deletedProject = await client.deleteProject(createdProject.id);

      expect(deletedProject.id).toBe(createdProject.id);
      expect(deletedProject.name).toBe(projectName);
      expect(deletedProject.org_id).toBe(orgId);
    });
  });

  describe("Project Members Management", () => {
    let projectId: number;

    beforeEach(async () => {
      const projectName = `Test Project ${Date.now()}`;
      const project = await client.createProject(orgId, projectName);
      projectId = project.id;
    });

    test("should get empty member list initially", async () => {
      const members = await client.getProjectMembers(projectId);

      expect(Array.isArray(members)).toBe(true);
      expect(members.length).toBe(0);
    });

    test("should add project member", async () => {
      const walletAddress = walletClient2.account.address;
      const role = "developer";

      const member = await client.addProjectMember(
        projectId,
        walletAddress,
        role
      );

      expect(member.project_id).toBe(projectId);
      expect(member.wallet_address).toBe(walletAddress.toLowerCase());
      expect(member.role).toBe(role);
    });

    test("should add project admin", async () => {
      const walletAddress = walletClient2.account.address;
      const role = "admin";

      const member = await client.addProjectMember(
        projectId,
        walletAddress,
        role
      );

      expect(member.project_id).toBe(projectId);
      expect(member.wallet_address).toBe(walletAddress.toLowerCase());
      expect(member.role).toBe(role);
    });
  });

  describe("Project Permission Management", () => {
    let projectId: number;

    beforeEach(async () => {
      const projectName = `Test Project ${Date.now()}`;
      const project = await client.createProject(orgId, projectName);
      projectId = project.id;

      // Add client2 as project admin
      await client.addProjectMember(
        projectId,
        walletClient2.account.address,
        "admin"
      );
    });

    test("project admin can add members", async () => {
      const thirdWalletAddress = walletClient3.account.address;

      const member = await client2.addProjectMember(
        projectId,
        thirdWalletAddress,
        "developer"
      );

      expect(member.project_id).toBe(projectId);
      expect(member.wallet_address).toBe(thirdWalletAddress.toLowerCase());
      expect(member.role).toBe("developer");
    });

    test("project admin can update member roles", async () => {
      const thirdWalletAddress = walletClient3.account.address;

      await client2.addProjectMember(projectId, thirdWalletAddress, "viewer");
      const updatedMember = await client2.updateProjectMemberRole(
        projectId,
        thirdWalletAddress,
        "developer"
      );

      expect(updatedMember.role).toBe("developer");
    });

    test("project admin can remove members", async () => {
      const thirdWalletAddress = walletClient3.account.address;

      await client2.addProjectMember(
        projectId,
        thirdWalletAddress,
        "developer"
      );
      const removedMember = await client2.removeProjectMember(
        projectId,
        thirdWalletAddress
      );

      expect(removedMember.wallet_address).toBe(
        thirdWalletAddress.toLowerCase()
      );

      const members = await client.getProjectMembers(projectId);
      expect(members.length).toBe(1); // Only the admin should remain
      expect(members[0].wallet_address).toBe(
        walletClient2.account.address.toLowerCase()
      );
    });
  });

  describe("Role Validation", () => {
    let projectId: number;

    beforeEach(async () => {
      const projectName = `Test Project ${Date.now()}`;
      const project = await client.createProject(orgId, projectName);
      projectId = project.id;

      await client.addProjectMember(
        projectId,
        walletClient2.account.address,
        "admin"
      );
    });

    test("should accept valid project roles", async () => {
      const walletAddress2 = walletClient2.account.address;
      const walletAddress3 = walletClient3.account.address;

      // Test admin role
      await client2.addProjectMember(projectId, walletAddress3, "admin");
      let members = await client.getProjectMembers(projectId);
      const adminMember = members.find(
        (m) => m.wallet_address === walletAddress3.toLowerCase()
      );
      expect(adminMember?.role).toBe("admin");

      // Test developer role
      await client2.updateProjectMemberRole(
        projectId,
        walletAddress3,
        "developer"
      );
      members = await client.getProjectMembers(projectId);
      const devMember = members.find(
        (m) => m.wallet_address === walletAddress3.toLowerCase()
      );
      expect(devMember?.role).toBe("developer");

      // Test viewer role
      await client2.updateProjectMemberRole(
        projectId,
        walletAddress3,
        "viewer"
      );
      members = await client.getProjectMembers(projectId);
      const viewerMember = members.find(
        (m) => m.wallet_address === walletAddress3.toLowerCase()
      );
      expect(viewerMember?.role).toBe("viewer");
    });
  });
});
