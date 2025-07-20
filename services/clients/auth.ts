import * as viem from "viem";
import { MinimalPersistentStorage, UserProfile } from "../shared/types";
import { BaseClient } from "../shared/baseClient";

export class HaitheAuthClient extends BaseClient {
  private walletClient: viem.WalletClient;
  private authToken: string | null = null;
  private _persistentStorage: MinimalPersistentStorage | null = null;

  constructor(options: {
    walletClient: viem.WalletClient;
    baseUrl: string;
    debug?: boolean;
  }) {
    super(options.baseUrl, options.debug);
    this.walletClient = options.walletClient;
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
}