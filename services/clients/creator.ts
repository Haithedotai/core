import * as viem from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { HaitheAuthClient } from "./auth";
import { BaseClient } from "../shared/baseClient";
import definitions from "../../definitions";
import { extractPrivateKeyFromSignature } from "../shared/utils";
import type { Creator } from "../shared/types";

export class HaitheCreatorClient extends BaseClient {
  private authClient: HaitheAuthClient;

  constructor(authClient: HaitheAuthClient, options?: { debug?: boolean }) {
    super(authClient["baseUrl"], options?.debug);
    this.authClient = authClient;
  }

  async becomeCreator(uri: string, contractAddress: string): Promise<Creator> {
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

    const encryptionWallet = viem.createWalletClient({
      chain: this.authClient.walletClient.chain,
      transport: viem.http(),
      account: privateKeyToAccount(encryptionKey),
    });

    const pubKey = encryptionWallet.account.publicKey;

    const hash = await this.authClient.walletClient.writeContract({
      ...definitions.HaitheOrchestrator,
      functionName: "registerAsCreator",
      args: [this.authClient.walletClient.account.address, uri, seed, pubKey],
    });

    await this.authClient.publicClient.waitForTransactionReceipt({ hash });

    return await this.fetch("/api/v1/creator", this.authClient.getAuthToken(), {
      method: "POST",
      body: JSON.stringify({
        uri,
        pvt_key_seed: seed,
        pub_key: pubKey,
      }),
    });
  }
}
