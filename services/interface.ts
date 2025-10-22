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
  type Conversation,
  type Message,
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

  setProjectTelegramToken(projectId: number, token: string | null): Promise<{}> {
    return this.projects.setTelegramToken(projectId, token);
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

  organizationBalance(orgId: number): Promise<{ balance: number }> {
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

  updateProject(id: number, updates: {
    name?: string;
    search_enabled?: boolean;
    memory_enabled?: boolean;
    default_model_id?: number;
  }): Promise<Project> {
    return this.projects.updateProject(id, updates);
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

  getAllCreators(): Promise<CreatorDetails[]> {
    return this.creator.getAllCreators();
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

  updateProduct(
    id: number, 
    updates: { description?: string; photo_url?: string }
  ): Promise<Product> {
    return this.products.updateProduct(id, updates);
  }

  getProjectProducts(projectId: number): Promise<number[]> {
    return this.projects.getProjectProducts(projectId);
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

  // Chat/Conversation methods
  getConversations(orgUid: string, projectUid: string): Promise<Conversation[]> {
    return this.projects.getConversations(orgUid, projectUid);
  }

  createConversation(orgUid: string, projectUid: string): Promise<Conversation> {
    return this.projects.createConversation(orgUid, projectUid);
  }

  getConversation(id: number, orgUid: string, projectUid: string): Promise<Conversation> {
    return this.projects.getConversation(id, orgUid, projectUid);
  }

  updateConversation(id: number, title: string, orgUid: string, projectUid: string): Promise<Conversation> {
    return this.projects.updateConversation(id, title, orgUid, projectUid);
  }

  deleteConversation(id: number, orgUid: string, projectUid: string): Promise<{ rows_affected: number }> {
    return this.projects.deleteConversation(id, orgUid, projectUid);
  }

  getConversationMessages(conversationId: number, orgUid: string, projectUid: string): Promise<Message[]> {
    return this.projects.getConversationMessages(conversationId, orgUid, projectUid);
  }

  createMessage(conversationId: number, message: string, sender: string, orgUid: string, projectUid: string): Promise<Message> {
    return this.projects.createMessage(conversationId, message, sender, orgUid, projectUid);
  }

  setTelegramToken(projectId: number, token: string | null): Promise<{}> {
    return this.projects.setTelegramToken(projectId, token);
  }

  getTelegramInfo(projectId: number): Promise<{
    configured: boolean;
    running: boolean;
    org_uid: string;
    project_uid: string;
    me: null | {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
      can_join_groups?: boolean;
      can_read_all_group_messages?: boolean;
      supports_inline_queries?: boolean;
      link?: string | null;
    };
  }> {
    return this.projects.getTelegramInfo(projectId);
  }

  setDiscordToken(projectId: number, token: string | null): Promise<{}> {
    return this.projects.setDiscordToken(projectId, token);
  }

  getDiscordInfo(projectId: number): Promise<{
    configured: boolean;
    running: boolean;
    org_uid: string;
    project_uid: string;
    me: null | {
      id: string;
      username: string;
      discriminator: string;
      avatar: string | null;
      bot: boolean;
      system: boolean;
      mfa_enabled: boolean;
      banner: string | null;
      accent_colour: number | null;
      locale: string | null;
      verified: boolean | null;
      email: string | null;
      flags: number | null;
      premium_type: number | null;
      public_flags: number | null;
    };
  }> {
    return this.projects.getDiscordInfo(projectId);
  }

  getCompletions(
    orgUid: string, 
    projectUid: string, 
    body: {
      model: string;
      messages: Array<{ role: string; content: string }>;
      n?: number;
      temperature?: number;
    }
  ): Promise<{
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
      index: number;
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
    }>;
    usage: {
      total_cost: number;
      expense_till_now: number;
      prompt_tokens: number;
    };
  }> {
    return this.projects.getCompletions(orgUid, projectUid, body);
  }
}

export * from "./clients";

export default HaitheClient;
