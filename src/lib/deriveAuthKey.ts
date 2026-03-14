import { scryptAsync } from "@noble/hashes/scrypt.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import { getPublicKey } from "nostr-tools/pure";

export async function deriveAuthKeypair(username: string, password: string) {
  const salt = `coinos:auth:${username.toLowerCase().replace(/\s/g, "")}`;
  const sk = await scryptAsync(password, salt, { N: 2 ** 16, r: 8, p: 1, dkLen: 32 });
  const pubkey = getPublicKey(sk);
  return { sk, pubkey, skHex: bytesToHex(sk) };
}

export async function deriveWalletEntropy(sk: Uint8Array): Promise<ArrayBuffer> {
  const { finalizeEvent } = await import("nostr-tools/pure");
  const event = { kind: 1, created_at: 0, content: "coinos-wallet-key-derivation", tags: [] };
  const signed = finalizeEvent(event as any, sk);
  const sigBytes = new Uint8Array(signed.sig.length / 2);
  for (let i = 0; i < signed.sig.length; i += 2)
    sigBytes[i / 2] = parseInt(signed.sig.slice(i, i + 2), 16);
  return crypto.subtle.digest("SHA-256", sigBytes);
}
