import { prfEncrypt, prfDecrypt } from "$lib/crypto";
import { rememberPrfKey, defaultRememberForMs } from "$lib/passwordCache";
import { post } from "$lib/utils";

export function generateCanonicalKey(): ArrayBuffer {
  return crypto.getRandomValues(new Uint8Array(32)).buffer as ArrayBuffer;
}

export async function wrapCanonicalKey(
  wrappingKey: ArrayBuffer,
  canonicalKey: ArrayBuffer,
): Promise<string> {
  return prfEncrypt(wrappingKey, new Uint8Array(canonicalKey));
}

export async function unwrapCanonicalKey(
  wrappingKey: ArrayBuffer,
  encrypted: string,
): Promise<ArrayBuffer> {
  const bytes = await prfDecrypt(wrappingKey, encrypted);
  return bytes.buffer as ArrayBuffer;
}

export async function resolveCanonicalKey(
  methodId: string,
  wrappingKey: ArrayBuffer,
  encryptedKeys: Record<string, string> | null | undefined,
  oldPrfKey: ArrayBuffer,
): Promise<{ canonicalKey: ArrayBuffer; encryptedKeys: Record<string, string> }> {
  if (encryptedKeys && encryptedKeys[methodId]) {
    try {
      // Try new wrapping key first (e.g. PRF-derived)
      const canonicalKey = await unwrapCanonicalKey(wrappingKey, encryptedKeys[methodId]);
      rememberPrfKey(canonicalKey, defaultRememberForMs);
      return { canonicalKey, encryptedKeys };
    } catch {
      // Fallback: try old key (e.g. SHA-256(credentialId)) and re-wrap with new key
      const canonicalKey = await unwrapCanonicalKey(oldPrfKey, encryptedKeys[methodId]);
      const wrapped = await wrapCanonicalKey(wrappingKey, canonicalKey);
      const updated = { ...encryptedKeys, [methodId]: wrapped };
      await saveEncryptedKeys(updated);
      rememberPrfKey(canonicalKey, defaultRememberForMs);
      return { canonicalKey, encryptedKeys: updated };
    }
  }

  // Migration: old PRF key becomes canonical key
  const canonicalKey = oldPrfKey;
  const wrapped = await wrapCanonicalKey(wrappingKey, canonicalKey);
  const updated = { ...encryptedKeys, [methodId]: wrapped };
  await saveEncryptedKeys(updated);
  rememberPrfKey(canonicalKey, defaultRememberForMs);
  return { canonicalKey, encryptedKeys: updated };
}

export async function saveEncryptedKeys(
  encryptedKeys: Record<string, string>,
): Promise<void> {
  await post("/user", { encryptedKeys });
}

export function passwordMethodId(): string {
  return "password";
}

export function passkeyMethodId(credentialId: string): string {
  return `passkey:${credentialId}`;
}

export function nostrMethodId(pubkey: string): string {
  return `nostr:${pubkey}`;
}
