import * as viem from "viem";
import type { MinimalPersistentStorage, UserProfile } from "../shared/types";
import { BaseClient } from "../shared/baseClient";
import definitions from "../definitions";

export class HaitheAuthClient extends BaseClient {
  public walletClient: viem.WalletClient;
  public publicClient: viem.PublicClient;
  private authToken: string | null = null;
  private _persistentStorage: MinimalPersistentStorage | null = null;

  constructor(options: {
    walletClient: viem.WalletClient;
    baseUrl: string;
    debug?: boolean;
  }) {
    super(options.baseUrl, options.debug);

    if (!options.walletClient.chain) {
      throw new Error("Wallet client is required");
    }

    this.walletClient = options.walletClient;
    this.publicClient = viem.createPublicClient({
      chain: options.walletClient.chain,
      transport: viem.http(options.walletClient.chain.rpcUrls.default.http[0]),
    });
  }

  static ensureWeb3Ready(
    walletClient: viem.WalletClient
  ): walletClient is viem.WalletClient<
    viem.Transport,
    viem.Chain,
    viem.Account
  > {
    return !(
      !walletClient ||
      !walletClient.account ||
      !walletClient.account.address
    );
  }

  private persistAuthToken(token: string): void {
    this.setAuthToken(token);
    if (this._persistentStorage) {
      this._persistentStorage.setItem("authToken", token);
    }
  }

  private syncAuthTokenFromStorage(): void {
    if (this._persistentStorage) {
      const token = this._persistentStorage.getItem("authToken");
      if (token) {
        this.setAuthToken(token);
      }
    }
  }

  isWeb3Ready(): boolean {
    return !!this.walletClient && !!this.walletClient.account?.address;
  }

  set persistentStorage(engine: MinimalPersistentStorage) {
    this._persistentStorage = engine;
    this.syncAuthTokenFromStorage();
    this.authToken && this.persistAuthToken(this.authToken);
  }

  private setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  isLoggedIn(): boolean {
    return !!this.authToken;
  }

  async login(): Promise<void> {
    if (!HaitheAuthClient.ensureWeb3Ready(this.walletClient)) {
      throw new Error("Wallet client is not ready");
    }

    const address = this.walletClient.account.address;

    const { nonce } = await this.fetch<{ nonce: string }>(
      `/v1/auth/nonce?address=${address}`,
      this.authToken
    );

    const signature = await this.walletClient.signMessage({
      message: nonce,
    });

    const { token } = await this.fetch<{ token: string }>(
      `/v1/auth/login?address=${address}&signature=${signature}`,
      this.authToken,
      { method: "POST" }
    );

    this.setAuthToken(token);
    this.persistAuthToken(token);
  }

  profile(): Promise<UserProfile> {
    return this.fetch("/v1/me", this.authToken);
  }

  async apiKeyLastIssued(): Promise<{
    issued_at: number;
  }> {
    if (!this.isLoggedIn()) {
      throw new Error("Not logged in");
    }

    return this.fetch("/v1/me/api-key/last-issued", this.authToken);
  }

  async generateApiKey(): Promise<{
    api_key: string;
    message: string;
    issued_at: number;
  }> {
    if (!this.isLoggedIn()) {
      throw new Error("Not logged in");
    }

    return this.fetch("/v1/me/api-key", this.authToken);
  }

  async disableApiKey(): Promise<void> {
    if (!this.isLoggedIn()) {
      throw new Error("Not logged in");
    }

    await this.fetch("/v1/me/api-key/disable", this.authToken, {
      method: "POST",
    });
  }

  async logout(): Promise<void> {
    if (!this.isLoggedIn()) {
      throw new Error("Not logged in");
    }

    await this.fetch("/v1/auth/logout", this.authToken, { method: "POST" });
    this.setAuthToken(null);
    if (this._persistentStorage) {
      this._persistentStorage.removeItem("authToken");
    }
  }

  async getFaucetInfo(): Promise<{
    last_request: {
      id: number;
      product_id: number;
      requested_at: string;
    };
  }> {
    if (!this.isLoggedIn()) {
      throw new Error("Not logged in");
    }

    return this.fetch("/v1/me/faucet", this.authToken);
  }

  async requestFaucetTokens(productId?: number): Promise<{
    amount: string;
    token: string;
    product_id: number;
    transaction_hash: string;
    recipient: string;
  }> {
    if (!this.isLoggedIn()) {
      throw new Error("Not logged in");
    }

    const body = productId ? { product_id: productId } : {};

    return this.fetch("/v1/me/faucet", this.authToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  async usdtBalance(): Promise<bigint> {
    if (!this.isLoggedIn()) {
      throw new Error("Not logged in");
    }
    if (!HaitheAuthClient.ensureWeb3Ready(this.walletClient)) {
      throw new Error("Wallet client is not ready");
    }

    return this.publicClient.readContract({
      ...definitions.tUSDT,
      functionName: "balanceOf",
      args: [this.walletClient.account.address],
    });
  }

  async transferUSDT(
    recipient: viem.Address,
    amount: bigint
  ): Promise<`0x${string}`> {
    if (!this.isLoggedIn()) {
      throw new Error("Not logged in");
    }
    if (!HaitheAuthClient.ensureWeb3Ready(this.walletClient)) {
      throw new Error("Wallet client is not ready");
    }

    return this.walletClient.writeContract({
      ...definitions.tUSDT,
      functionName: "transfer",
      args: [recipient, amount],
    });
  }
}
