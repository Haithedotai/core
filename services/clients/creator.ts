import * as viem from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { HaitheAuthClient } from "./auth";
import { BaseClient } from "../shared/baseClient";
import definitions from "../../definitions";
import { extractPrivateKeyFromSignature } from "../shared/utils";
import type { Creator, CreatorDetails, Product } from "../shared/types";
import { encrypt } from "alith/data";

export class HaitheCreatorClient extends BaseClient {
  private authClient: HaitheAuthClient;

  constructor(authClient: HaitheAuthClient, options?: { debug?: boolean }) {
    super(authClient["baseUrl"], options?.debug);
    this.authClient = authClient;
  }

  private async getEncryptionKey() {
    if (!HaitheAuthClient.ensureWeb3Ready(this.authClient.walletClient)) {
      throw new Error("Wallet client is not ready");
    }

    const seed = await this.authClient.publicClient.readContract({
      ...definitions.HaitheCreatorIdentity,
      functionName: "determineNextSeed",
      args: [this.authClient.walletClient.account.address],
    });

    const signedSeed = await this.authClient.walletClient.signMessage({
      message: { raw: seed },
    });

    const encryptionKey = extractPrivateKeyFromSignature(signedSeed);

    if (!encryptionKey) {
      throw new Error("Failed to extract encryption key from signature");
    }

    return encryptionKey;
  }

  async isCreator(): Promise<boolean> {
    if (!HaitheAuthClient.ensureWeb3Ready(this.authClient.walletClient)) {
      throw new Error("Wallet client is not ready");
    }

    const isCreator = await this.authClient.publicClient.readContract({
      ...definitions.HaitheOrchestrator,
      functionName: "creators",
      args: [this.authClient.walletClient.account.address],
    });

    return isCreator > 0n;
  }

  // async getCreator(id: string): Promise<{
  //   name: string;
  //   description: string;
  //   avatar: string;
  // }> {
  //   if (!HaitheAuthClient.ensureWeb3Ready(this.authClient.walletClient)) {
  //     throw new Error("Wallet client is not ready");
  //   }

  //   // TODO: read from smart contract

  //   return {
  //     name: "Haithe",
  //     description: "Haithe is a platform for creating and sharing AI agents.",
  //     avatar: "https://haithe.ai/logo.png",
  //   };
  // }

  async getCreatorByAddress(walletAddress: string): Promise<CreatorDetails> {
    const response = await this.fetch<{ creator: CreatorDetails }>(
      `/v1/creator/${walletAddress}`,
      null
    );

    return response.creator;
  }

  async getCreatorProducts(walletAddress: string): Promise<Product[]> {
    const response = await this.fetch<{ products: Product[] }>(
      `/v1/creator/${walletAddress}/products`,
      null
    );
    return response.products;
  }

  async becomeCreator(uri: string): Promise<Creator> {
    if (!HaitheAuthClient.ensureWeb3Ready(this.authClient.walletClient)) {
      throw new Error("Wallet client is not ready");
    }

    const encryptionKey = await this.getEncryptionKey();

    const seed = await this.authClient.publicClient.readContract({
      ...definitions.HaitheCreatorIdentity,
      functionName: "determineNextSeed",
      args: [this.authClient.walletClient.account.address],
    });

    const encryptionWallet = viem.createWalletClient({
      chain: this.authClient.walletClient.chain,
      transport: viem.http(),
      account: privateKeyToAccount(encryptionKey),
    });

    const pubKey = encryptionWallet.account.publicKey;

    return await this.fetch("/v1/creator", this.authClient.getAuthToken(), {
      method: "POST",
      body: JSON.stringify({
        uri,
        pvt_key_seed: seed,
        pub_key: pubKey,
      }),
    });
  }

  async uploadToMarketplaceAndGetReward(
    name: string,
    file: File,
    category:
      | "knowledge:text"
      | "knowledge:html"
      | "knowledge:pdf"
      | "knowledge:csv"
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
    if (!HaitheAuthClient.ensureWeb3Ready(this.authClient.walletClient)) {
      throw new Error("Wallet client is not ready");
    }

    const encryptionKey = await this.getEncryptionKey();
    const { tee_pubkey } = await this.fetch<{ tee_pubkey: string }>(
      "/v1/tee/pub-key",
      this.authClient.getAuthToken()
    );
    const password =
      // deriveDHKE(encryptionKey, tee_pubkey);
      "0x777254e77e62bb5be8fecfc11801f43552c0e9563a582e09e4f421acf51ccda866c0ca67766a477d0a8a97d1f0f66c692e497e778f6aa2921cbcace3ff4a78161b";

    const arrayBuffer = await file.arrayBuffer();
    const encryptedData = await encrypt(new Uint8Array(arrayBuffer), password);
    const encryptedFile = new File([encryptedData], file.name, { type: file.type });
    const encryptedKeyUint8 = await encrypt(
      new TextEncoder().encode(tee_pubkey + encryptionKey),
      password
    );
    const encryptedKey = Array.from(encryptedKeyUint8)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const url = await upload_fn(encryptedFile);

    const hash = await this.authClient.walletClient.writeContract({
      ...definitions.HaitheOrchestrator,
      functionName: "addProduct",
      args: [
        name,
        url,
        crypto.getRandomValues(new Uint8Array(16)).toString(),
        encryptedKey,
        category,
        pricePerCall,
      ],
    });

    await this.authClient.publicClient.waitForTransactionReceipt({ hash });

    return this.fetch("/v1/products", this.authClient.getAuthToken(), {
      method: "POST",
      body: JSON.stringify({
        name,
        url,
        encrypted_key: encryptedKey,
        category,
        price_per_call: pricePerCall.toString(),
      }),
    });
  }
}
