import { BaseClient } from "../shared/baseClient";
import type { Organization, OrganizationMember } from "../shared/types";
import { HaitheAuthClient } from "./auth";
import definitions from "../../definitions";

export class HaitheOrgsClient extends BaseClient {
  private authClient: HaitheAuthClient;

  constructor(authClient: HaitheAuthClient, options?: { debug?: boolean }) {
    super(authClient["baseUrl"], options?.debug);
    this.authClient = authClient;
  }

  getUserOrganizations(): Promise<Organization[]> {
    return this.fetch(`/v1/me/orgs`, this.authClient.getAuthToken());
  }

  async createOrganization(name: string): Promise<Organization> {
    if (!HaitheAuthClient.ensureWeb3Ready(this.authClient.walletClient)) {
      throw new Error("Wallet client is not ready");
    }

    const hash = await this.authClient.walletClient.writeContract({
      ...definitions.HaitheOrchestrator,
      functionName: "createOrganization",
      args: [name],
    });
    await this.authClient.publicClient.waitForTransactionReceipt({ hash });

    return this.fetch(`/v1/orgs`, this.authClient.getAuthToken(), {
      method: "POST",
    });
  }

  getOrganization(id: number): Promise<Organization> {
    return this.fetch(`/v1/orgs/${id}`, this.authClient.getAuthToken());
  }

  updateOrganization(id: number, name: string): Promise<Organization> {
    return this.fetch(
      `/v1/orgs/${id}?name=${encodeURIComponent(name)}`,
      this.authClient.getAuthToken(),
      { method: "PATCH" }
    );
  }

  deleteOrganization(id: number): Promise<Organization> {
    return this.fetch(`/v1/orgs/${id}`, this.authClient.getAuthToken(), {
      method: "DELETE",
    });
  }

  getOrganizationMembers(orgId: number): Promise<OrganizationMember[]> {
    return this.fetch(
      `/v1/orgs/${orgId}/members`,
      this.authClient.getAuthToken()
    );
  }

  addOrganizationMember(
    orgId: number,
    walletAddress: string,
    role: "admin" | "member"
  ): Promise<OrganizationMember> {
    return this.fetch(
      `/v1/orgs/${orgId}/members?wallet_address=${encodeURIComponent(
        walletAddress
      )}&role=${role}`,
      this.authClient.getAuthToken(),
      { method: "POST" }
    );
  }

  updateOrganizationMemberRole(
    orgId: number,
    walletAddress: string,
    role: "admin" | "member"
  ): Promise<OrganizationMember> {
    return this.fetch(
      `/v1/orgs/${orgId}/members?wallet_address=${encodeURIComponent(
        walletAddress
      )}&role=${role}`,
      this.authClient.getAuthToken(),
      { method: "PATCH" }
    );
  }

  removeOrganizationMember(
    orgId: number,
    walletAddress: string
  ): Promise<OrganizationMember> {
    return this.fetch(
      `/v1/orgs/${orgId}/members?wallet_address=${encodeURIComponent(
        walletAddress
      )}`,
      this.authClient.getAuthToken(),
      { method: "DELETE" }
    );
  }
}
