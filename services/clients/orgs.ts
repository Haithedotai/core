import { BaseClient } from "../shared/baseClient";
import type { Organization, OrganizationMember } from "../shared/types";
import { HaitheAuthClient } from "./auth";
import definitions from "../../definitions";
import type { Address } from "viem";

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

  balance(orgId: number): Promise<{ balance: number }> {
    return this.fetch(
      `/v1/orgs/${orgId}/balance`,
      this.authClient.getAuthToken()
    );
  }

  getOrganizationExpenditure(orgId: number): Promise<{ expenditure: number }> {
    return this.fetch(
      `/v1/orgs/${orgId}/expenditure`,
      this.authClient.getAuthToken()
    );
  }

  getAvailableModels(): Promise<
    {
      id: number;
      name: string;
      display_name: string;
      provider: string;
      is_active: boolean;
      price_per_call: number;
    }[]
  > {
    return this.fetch(`/v1/models`, this.authClient.getAuthToken());
  }

  getEnabledModels(orgId: number): Promise<
    {
      id: number;
      name: string;
      display_name: string;
      provider: string;
      is_active: boolean;
      price_per_call: number;
    }[]
  > {
    return this.fetch(
      `/v1/orgs/${orgId}/models`,
      this.authClient.getAuthToken()
    );
  }

  enableModel(orgId: number, modelId: number): Promise<void> {
    return this.fetch(
      `/v1/orgs/${orgId}/models?model_id=${modelId}`,
      this.authClient.getAuthToken(),
      {
        method: "POST",
      }
    );
  }

  disableModel(orgId: number, modelId: number): Promise<void> {
    return this.fetch(
      `/v1/orgs/${orgId}/models?model_id=${modelId}`,
      this.authClient.getAuthToken(),
      {
        method: "DELETE",
      }
    );
  }

  async enableProduct(
    product_address: Address,
    org_address: Address
  ): Promise<void> {
    if (!HaitheAuthClient.ensureWeb3Ready(this.authClient.walletClient)) {
      throw new Error("Wallet client is not ready");
    }

    await this.authClient.walletClient.writeContract({
      ...definitions.HaitheOrganization,
      address: org_address,
      functionName: "enableProduct",
      args: [product_address],
    });
  }

  async disableProduct(
    product_address: Address,
    org_address: Address
  ): Promise<void> {
    if (!HaitheAuthClient.ensureWeb3Ready(this.authClient.walletClient)) {
      throw new Error("Wallet client is not ready");
    }

    await this.authClient.walletClient.writeContract({
      ...definitions.HaitheOrganization,
      address: org_address,
      functionName: "disableProduct",
      args: [product_address],
    });
  }

  async getEnabledProducts(org_address: Address): Promise<Address[]> {
    if (!HaitheAuthClient.ensureWeb3Ready(this.authClient.walletClient)) {
      throw new Error("Wallet client is not ready");
    }

    const products = await this.authClient.publicClient.readContract({
      ...definitions.HaitheOrganization,
      address: org_address,
      functionName: "getEnabledProducts",
    });

    return products as Address[];
  }
}
