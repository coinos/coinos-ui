import { browser } from "$app/environment";
import { getCachedPrfKey } from "$lib/passwordCache";

const DERIVATION_EVENT = {
  kind: 1,
  created_at: 0,
  content: "coinos-wallet-key-derivation",
  tags: [],
};

async function hashSignature(sig: string): Promise<ArrayBuffer> {
  const sigBytes = new Uint8Array(sig.length / 2);
  for (let i = 0; i < sig.length; i += 2) sigBytes[i / 2] = parseInt(sig.slice(i, i + 2), 16);
  return crypto.subtle.digest("SHA-256", sigBytes);
}

/**
 * Silent helper. Checks localStorage for nsec, signs fixed event locally,
 * caches and returns entropy. Returns null if no nsec stored.
 */
export async function tryDeriveFromNsec(): Promise<ArrayBuffer | null> {
  if (!browser) return null;
  const nsec = localStorage.getItem("nsec");
  if (!nsec) return null;

  try {
    const [nip19, { finalizeEvent }] = await Promise.all([
      import("nostr-tools/nip19"),
      import("nostr-tools/pure"),
    ]);
    const sk = nip19.decode(nsec).data as Uint8Array;
    const signed = finalizeEvent({ ...DERIVATION_EVENT } as any, sk);
    return await hashSignature(signed.sig);
  } catch (e) {
    console.log("nsec entropy derivation failed", e);
    return null;
  }
}

/**
 * Non-interactive. Checks cached prfKey, then tries silent nsec derivation.
 * Returns null if neither available. Use in onMount and auto-provisioning.
 */
export async function getWalletEntropy(): Promise<ArrayBuffer | null> {
  const cached = getCachedPrfKey();
  if (cached) return cached;
  return tryDeriveFromNsec();
}

/**
 * Interactive. Tries silent nsec first, then calls sign() from $lib/nostr
 * which shows Nostr.svelte modal if signer isn't ready. Caches result.
 * Use for "Unlock" buttons.
 */
export async function deriveNostrEntropy(): Promise<ArrayBuffer> {
  const cached = getCachedPrfKey();
  if (cached) return cached;

  const fromNsec = await tryDeriveFromNsec();
  if (fromNsec) return fromNsec;

  const { sign } = await import("$lib/nostr");
  const signed = await sign({ ...DERIVATION_EVENT });
  return hashSignature(signed.sig);
}
