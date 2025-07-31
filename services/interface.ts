import * as viem from "viem";
import type { Address } from "viem";
import {
  HaitheAuthClient,
  HaitheOrgsClient,
  HaitheProjectsClient,
  HaitheCreatorClient,
  HaitheProductsClient,
  type MinimalPersistentStorage,
  type Organization,
  type OrganizationMember,
  type Project,
  type ProjectMember,
  type UserProfile,
  type Creator,
  type Product,
  type CreatorDetails,
} from "./clients";

export class HaitheClient {
  public auth: HaitheAuthClient;
  public orgs: HaitheOrgsClient;
  public projects: HaitheProjectsClient;
  public creator: HaitheCreatorClient;
  public products: HaitheProductsClient;

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
    this.products = new HaitheProductsClient(this.auth, {
      debug: options.debug,
    });
  }

  get fetch() {
    return this.auth.fetch.bind(this.auth);
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

  apiKeyLastIssued(): Promise<{
    issued_at: number;
  }> {
    return this.auth.apiKeyLastIssued();
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
    return this.orgs.getAvailableModels();
  }

  enableProduct(
    productAddress: `0x${string}`,
    orgAddress: `0x${string}`
  ): Promise<void> {
    return this.orgs.enableProduct(productAddress, orgAddress);
  }

  disableProduct(
    productAddress: `0x${string}`,
    orgAddress: `0x${string}`
  ): Promise<void> {
    return this.orgs.disableProduct(productAddress, orgAddress);
  }

  getEnabledProducts(orgAddress: `0x${string}`): Promise<`0x${string}`[]> {
    return this.orgs.getEnabledProducts(orgAddress);
  }

  balance(orgId: number): Promise<{ balance: number }> {
    return this.orgs.balance(orgId);
  }

  getOrganizationExpenditure(orgId: number): Promise<{ expenditure: number }> {
    return this.orgs.getOrganizationExpenditure(orgId);
  }

  // Project methods
  createProject(orgId: number, name: string): Promise<Project> {
    return this.projects.createProject(orgId, name);
  }

  getProject(id: number): Promise<Project> {
    return this.projects.getProject(id);
  }

  getProjects(orgId: number): Promise<Project[]> {
    return this.projects.getProjects(orgId);
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

  pricePerCall(projectId: number): Promise<{
    total_price_per_call: number;
  }> {
    return this.projects.pricePerCall(projectId);
  }

  // Creator methods
  becomeCreator(uri: string): Promise<Creator> {
    return this.creator.becomeCreator(uri);
  }

  uploadToMarketplaceAndGetReward(
    name: string,
    file: File,
    category:
      | "knowledge:text"
      | "knowledge:html"
      | "knowledge:pdf"
      | "knowledge:csv"
      | "knowledge:html"
      | "knowledge:url"
      | "promptset"
      | "mcp"
      | "tool:rs"
      | "tool:js"
      | "tool:py"
      | "tool:rpc",
    pricePerCall: bigint,
    upload_fn: (data: File) => Promise<string>
  ) {
    return this.creator.uploadToMarketplaceAndGetReward(
      name,
      file,
      category,
      pricePerCall,
      upload_fn
    );
  }

  isCreator(): Promise<boolean> {
    return this.creator.isCreator();
  }

  getCreatorByAddress(walletAddress: string): Promise<CreatorDetails> {
    return this.creator.getCreatorByAddress(walletAddress);
  }

  getCreatorProducts(walletAddress: string): Promise<Product[]> {
    return this.creator.getCreatorProducts(walletAddress);
  }

  // Product methods
  getAllProducts(): Promise<Product[]> {
    return this.products.getAllProducts();
  }

  getProductById(id: number): Promise<Product> {
    return this.products.getProductById(id);
  }

  enableProjectProduct(projectId: number, productId: number): Promise<void> {
    return this.products.enableProjectProduct(projectId, productId);
  }

  disableProjectProduct(projectId: number, productId: number): Promise<void> {
    return this.products.disableProjectProduct(projectId, productId);
  }

  getProjectProducts(projectId: number): Promise<number[]> {
    return this.projects.getProjectProducts(projectId);
  }

  getEnabledModels(orgId: number): Promise<number[]> {
    return this.orgs.getEnabledModels(orgId);
  }

  enableModel(orgId: number, modelId: number): Promise<void> {
    return this.orgs.enableModel(orgId, modelId);
  }

  disableModel(orgId: number, modelId: number): Promise<void> {
    return this.orgs.disableModel(orgId, modelId);
  }

  getFaucetInfo(): Promise<{
    last_request: {
      id: number;
      product_id: number;
      requested_at: string;
    };
  }> {
    return this.auth.getFaucetInfo();
  }

  requestFaucetTokens(productId?: number): Promise<{
    amount: string;
    token: string;
    product_id: number;
    transaction_hash: string;
    recipient: string;
  }> {
    return this.auth.requestFaucetTokens(productId);
  }

  usdtBalance(): Promise<bigint> {
    return this.auth.usdtBalance();
  }

  transferUSDT(recipient: viem.Address, amount: bigint): Promise<`0x${string}`> {
    return this.auth.transferUSDT(recipient, amount);
  }
}

export * from "./clients";

export default HaitheClient;
