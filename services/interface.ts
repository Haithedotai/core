import * as viem from "viem";

class HaitheClient {
  private walletClient: viem.WalletClient;
  private baseUrl: string = "";
  private authToken: string | null = null;
  private _persistentStorage: MinimalPersistentStorage | null = null;

  constructor(options: { walletClient: viem.WalletClient; baseUrl: string }) {
    const { walletClient, baseUrl } = options;

    this.walletClient = walletClient;
    this.baseUrl = baseUrl;
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
  }

  private fetch<T>(uri: string): Promise<T> {
    if (!this.baseUrl) {
      throw new Error("Base URL is not set");
    }
    if (!uri.startsWith("/")) {
      uri = `/${uri}`;
    }
    const url = new URL(uri, this.baseUrl);

    return new Promise((resolve, reject) => {
      fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((response) => {
          if (!response.success)
            throw new Error(
              "Api call was not successful : " + response.message
            );
          if (!response.data) throw new Error("Response data is missing");

          console.log(response.message);
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
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

  isLoggedIn(): boolean {
    return !!this.authToken;
  }

  login(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!HaitheClient.ensureWeb3Ready(this.walletClient)) {
        return reject(new Error("Wallet client is not ready"));
      }

      const address = this.walletClient.account.address;

      const { nonce } = await this.fetch<{ nonce: string }>(
        `/v1/auth/nonce?address=${address}`
      );

      const signature = await this.walletClient.signMessage({
        message: nonce,
      });

      const { token } = await this.fetch<{ token: string }>(
        `/v1/auth/login?address=${address}&signature=${signature}`
      );

      this.setAuthToken(token);
      this.persistAuthToken(token);

      resolve();
    });
  }

  profile(): Promise<{
    address: string;
    registered: number;
  }> {
    return this.fetch("/v1/auth/me");
  }

  logout(): void {
    this.fetch("/v1/auth/logout").then(() => {
      this.setAuthToken(null);
      if (this._persistentStorage) {
        this._persistentStorage.removeItem("authToken");
      }
    });
  }
}

type MinimalPersistentStorage = {
  setItem: (key: string, value: any) => void;
  getItem: (key: string) => any;
  removeItem: (key: string) => void;
};
