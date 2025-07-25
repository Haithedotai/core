import { encodePacked, toHex } from "viem";
import { getSharedSecret } from "@noble/secp256k1";

export function extractPrivateKeyFromSignature(
  signature: `0x${string}`
): `0x${string}` {
  const signatureWithoutPrefix = signature.slice(2);

  let privateKey = signatureWithoutPrefix.slice(0, 64);
  if (privateKey.length < 64) {
    privateKey = privateKey.padStart(64, "0");
  }

  return `0x${privateKey}`;
}
