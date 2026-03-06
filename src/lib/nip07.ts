import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { finalizeEvent, getPublicKey } from "nostr-tools/pure";
import * as libnip44 from "$lib/nip44";
import { u } from "$lib/nip44";

import { eventToSign, signer } from "$lib/store";
import { get } from "svelte/store";

// Try to load sk from localStorage nsec and populate the signer store.
const tryNsecFromStorage = async (): Promise<Uint8Array | null> => {
  const nsec = localStorage.getItem("nsec");
  if (!nsec) return null;

  try {
    const { nip19 } = await import("nostr-tools");
    const { type, data } = nip19.decode(nsec);
    if (type !== "nsec" || !(data instanceof Uint8Array)) return null;

    const sk = data;
    const pk = getPublicKey(sk);
    signer.set({
      method: "nsec",
      params: { sk: bytesToHex(sk), pk },
      ready: true,
    });
    return sk;
  } catch {
    return null;
  }
};

// Ensures we have access to a secret key, triggering the signer modal if needed.
// Returns the sk as Uint8Array, or null if using NIP-07 extension.
export const ensureSigner = async (userPubkey: string): Promise<Uint8Array | null> => {
  // Check if signer already has a valid sk that matches the user's pubkey
  const currentSigner = get(signer);
  if (currentSigner?.ready && currentSigner?.params?.sk && currentSigner.params.sk.length === 64) {
    const sk = hexToBytes(currentSigner.params.sk);
    if (getPublicKey(sk) === userPubkey) return sk;
    // Stale signer — clear it so we re-derive below
    signer.set(undefined);
  }

  // Try to load from localStorage nsec before triggering the modal
  const skFromStorage = await tryNsecFromStorage();
  if (skFromStorage) {
    if (getPublicKey(skFromStorage) === userPubkey) return skFromStorage;
    // localStorage nsec doesn't match — clear it
    localStorage.removeItem("nsec");
    signer.set(undefined);
  }

  // Try to derive nostr key from cached canonical key (e.g. passkey accounts)
  try {
    const { autoUnlockNostr } = await import("$lib/seed");
    await autoUnlockNostr(userPubkey);
    const skFromDerived = await tryNsecFromStorage();
    if (skFromDerived) return skFromDerived;
  } catch {}

  // Fall back to NIP-07 extension if available and matches user
  if (window.nostr) {
    try {
      const extPubkey = await window.nostr.getPublicKey();
      if (extPubkey === userPubkey) {
        return null; // Use NIP-07
      }
    } catch (e) {
      // Extension didn't work, fall through to signer modal
    }
  }

  // Clear invalid signer state before triggering modal
  if (
    currentSigner?.ready &&
    (!currentSigner?.params?.sk || currentSigner.params.sk.length !== 64)
  ) {
    signer.set(undefined);
  }

  // Trigger the signer modal with a dummy event
  const dummyEvent = {
    kind: 14,
    content: "DM encryption",
    tags: [],
    created_at: Math.floor(Date.now() / 1000),
  };
  eventToSign.set(dummyEvent);

  // Wait for signer to be ready
  const signerValue = await new Promise<any>((resolve, reject) => {
    let unsubscribe: () => void;
    unsubscribe = signer.subscribe((v) => {
      if (v === "cancel") {
        setTimeout(() => unsubscribe?.());
        eventToSign.set(null);
        reject(new Error("cancelled"));
      }
      if (v?.ready) {
        setTimeout(() => unsubscribe?.());
        eventToSign.set(null);
        resolve(v);
      }
    });
  });

  if (signerValue?.params?.sk) {
    return hexToBytes(signerValue.params.sk);
  }

  // If extension method was selected
  if (signerValue?.method === "extension") {
    return null; // Use NIP-07
  }

  throw new Error("No signing method available");
};

// Signs an event using NIP-07 if available, otherwise getPrivateKey()
export const signEvent = async (event: any, user: any): Promise<any> => {
  const sk = await ensureSigner(user.pubkey);
  if (sk === null) {
    return (window as any).nostr.signEvent(event);
  } else {
    return finalizeEvent(event, sk);
  }
};

// Encrypts an event in NIP-44 using NIP-07 if available, otherwise getPrivateKey()
export const encrypt = async (json: any, user: any, receiverPK: string): Promise<string> => {
  const senderSK = await ensureSigner(user.pubkey);
  if (senderSK === null) {
    return (window as any).nostr.nip44.encrypt(receiverPK, JSON.stringify(json));
  } else {
    const senderSKString = bytesToHex(senderSK);
    const ckey = u.getConversationKey(senderSKString, receiverPK);
    return libnip44.encrypt(JSON.stringify(json), ckey);
  }
};

// Decrypts an event in NIP-44 using NIP-07 if available, otherwise getPrivateKey()
export const decrypt = async (encrypted: string, user: any, receiverPK: string): Promise<any> => {
  const senderSK = await ensureSigner(user.pubkey);
  if (senderSK === null) {
    return JSON.parse(await (window as any).nostr.nip44.decrypt(receiverPK, encrypted));
  } else {
    const senderSKString = bytesToHex(senderSK);
    const ckey = u.getConversationKey(senderSKString, receiverPK);
    return JSON.parse(libnip44.decrypt(encrypted, ckey));
  }
};
