import * as viem from "viem";
import {
  HaitheAuthClient,
  HaitheOrgsClient,
  HaitheProjectsClient,
  HaitheCreatorClient,
  type MinimalPersistentStorage,
  type Organization,
  type OrganizationMember,
  type Project,
  type ProjectMember,
  type UserProfile,
  type Creator,
} from "./clients";

export class HaitheClient {
  public auth: HaitheAuthClient;
  public orgs: HaitheOrgsClient;
  public projects: HaitheProjectsClient;
  public creator: HaitheCreatorClient;

  constructor(options: {
    walletClient: viem.WalletClient;
    baseUrl: string;
    debug?: boolean;
  }) {
    this.auth = new HaitheAuthClient(options);
    this.orgs = new HaitheOrgsClient(this.auth, { debug: options.debug });
    this.projects = new HaitheProjectsClient(this.auth, {
      debug: options.debug,
    });
    this.creator = new HaitheCreatorClient(this.auth, { debug: options.debug });
  }


  static ensureWeb3Ready(
    walletClient: viem.WalletClient
  ): walletClient is viem.WalletClient<
    viem.Transport,
    viem.Chain,
    viem.Account
  > {
    return HaitheAuthClient.ensureWeb3Ready(walletClient);
  }

  set persistentStorage(engine: MinimalPersistentStorage) {
    this.auth.persistentStorage = engine;
  }

  isWeb3Ready(): boolean {
    return this.auth.isWeb3Ready();
  }

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  getAuthToken(): string | null {
    return this.auth.getAuthToken();
  }

  login(): Promise<void> {
    return this.auth.login();
  }

  profile(): Promise<UserProfile> {
    return this.auth.profile();
  }

  generateApiKey(): Promise<{
    api_key: string;
    message: string;
    issued_at: number;
  }> {
    return this.auth.generateApiKey();
  }

  disableApiKey(): Promise<void> {
    return this.auth.disableApiKey();
  }

  logout(): Promise<void> {
    return this.auth.logout();
  }

  // Creator methods
  registerAsCreator(uri: string): Promise<Creator> {
    return this.creator.becomeCreator(uri);
  }

  // Organization methods
  createOrganization(name: string): Promise<Organization> {
    return this.orgs.createOrganization(name);
  }

  getUserOrganizations(): Promise<Organization[]> {
    return this.orgs.getUserOrganizations();
  }

  getOrganization(id: number): Promise<Organization> {
    return this.orgs.getOrganization(id);
  }

  updateOrganization(id: number, name: string): Promise<Organization> {
    return this.orgs.updateOrganization(id, name);
  }

  deleteOrganization(id: number): Promise<Organization> {
    return this.orgs.deleteOrganization(id);
  }

  getOrganizationMembers(orgId: number): Promise<OrganizationMember[]> {
    return this.orgs.getOrganizationMembers(orgId);
  }

  addOrganizationMember(
    orgId: number,
    walletAddress: string,
    role: "admin" | "member"
  ): Promise<OrganizationMember> {
    return this.orgs.addOrganizationMember(orgId, walletAddress, role);
  }

  updateOrganizationMemberRole(
    orgId: number,
    walletAddress: string,
    role: "admin" | "member"
  ): Promise<OrganizationMember> {
    return this.orgs.updateOrganizationMemberRole(orgId, walletAddress, role);
  }

  removeOrganizationMember(
    orgId: number,
    walletAddress: string
  ): Promise<OrganizationMember> {
    return this.orgs.removeOrganizationMember(orgId, walletAddress);
  }


  // Project methods
  createProject(orgId: number, name: string): Promise<Project> {
    return this.projects.createProject(orgId, name);
  }

  getProject(id: number): Promise<Project> {
    return this.projects.getProject(id);
  }

  updateProject(id: number, name: string): Promise<Project> {
    return this.projects.updateProject(id, name);
  }

  deleteProject(id: number): Promise<Project> {
    return this.projects.deleteProject(id);
  }

  getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    return this.projects.getProjectMembers(projectId);
  }

  addProjectMember(
    projectId: number,
    walletAddress: string,
    role: "admin" | "developer" | "viewer"
  ): Promise<ProjectMember> {
    return this.projects.addProjectMember(projectId, walletAddress, role);
  }

  updateProjectMemberRole(
    projectId: number,
    walletAddress: string,
    role: "admin" | "developer" | "viewer"
  ): Promise<ProjectMember> {
    return this.projects.updateProjectMemberRole(
      projectId,
      walletAddress,
      role
    );
  }

  removeProjectMember(
    projectId: number,
    walletAddress: string
  ): Promise<ProjectMember> {
    return this.projects.removeProjectMember(projectId, walletAddress);
  }

  getProjects(orgId: number): Promise<Project[]> {
    return this.projects.getProjects(orgId);
  }

}

export * from "./clients";

export default HaitheClient;
