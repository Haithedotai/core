// mcp/evm/viemClient.ts
import {
  createPublicClient,
  createWalletClient,
  http,
  type WalletClient,
  type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

export function createViemPublicClient(
  rpcUrl: string,
  chain?: Chain
) {
  
  return createPublicClient({
    transport: http(rpcUrl),
    chain,
  });
}

export function createViemWalletClient(
  rpcUrl: string,
  privateKey: string,
  chain?: Chain
): { walletClient: WalletClient; address: `0x${string}` } {
  
  
  const normalizedKey = (privateKey.startsWith("0x")
    ? privateKey
    : `0x${privateKey}`) as `0x${string}`;

  const account = privateKeyToAccount(normalizedKey);

  const walletClient = createWalletClient({
    account,
    transport: http(rpcUrl),
    chain,
  });

  return {
    walletClient,
    address: account.address as `0x${string}`,
  };
}
