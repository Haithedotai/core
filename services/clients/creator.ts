import * as viem from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { HaitheAuthClient } from "./auth";
import { BaseClient } from "../shared/baseClient";
import definitions from "../../definitions";
import { extractPrivateKeyFromSignature } from "../shared/utils";
import type { Creator } from "../shared/types";
import { Client as AlithClient } from "alith/lazai";
import { encrypt } from "alith/data";
import NodeRSA from "node-rsa";
import axios from "axios";

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
    pricePerCall: bigint,
    upload_fn: (data: Blob) => Promise<string>
  ) {
    if (!HaitheAuthClient.ensureWeb3Ready(this.authClient.walletClient)) {
      throw new Error("Wallet client is not ready");
    }

    const lazaiClient = new AlithClient();

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
    const encryptedFile = new Blob([encryptedData], { type: file.type });

    const url = await upload_fn(encryptedFile);

    let fileId = await lazaiClient.getFileIdByUrl(url);
    if (fileId == BigInt(0)) {
      fileId = await lazaiClient.addFile(url);
    }

    await lazaiClient.requestProof(fileId, BigInt(100));
    const jobIds = await lazaiClient.fileJobIds(fileId);
    const jobId = jobIds[jobIds.length - 1];
    if (!jobId) {
      throw new Error("No job found for the file");
    }
    const job = await lazaiClient.getJob(jobId);
    const nodeInfo = await lazaiClient.getNode(job.nodeAddress);
    const nodeUrl = nodeInfo.url;
    const pubKey = nodeInfo.publicKey;
    const rsa = new NodeRSA(pubKey, "pkcs1-public-pem");
    const encryptedKey = rsa.encrypt(password, "hex");
    const proofRequest = {
      job_id: Number(jobId),
      file_id: Number(fileId),
      file_url: url,
      encryption_key: encryptedKey,
      // encryption_seed: encryptionSeed,
      nonce: null,
      proof_url: null,
    };
    const response = await axios.post(`${nodeUrl}/proof`, proofRequest, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 200) {
      console.log("Proof request sent successfully");
    } else {
      console.log("Failed to send proof request:", response.data);
    }

    //  Request DAT reward
    await lazaiClient.requestReward(fileId);

    this.authClient.walletClient.writeContract({
      ...definitions.HaitheOrchestrator,
      functionName: "addProduct",
      args: [
        name,
        url,
        crypto.getRandomValues(new Uint8Array(16)).toString(),
        encryptedKey,
        pricePerCall,
      ],
    });
  }
}
