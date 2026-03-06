/**
 * Unified messaging facade: MLS (marmot) with NIP-17 fallback.
 *
 * Drop-in replacement for the nip17 send/subscribe/getMessageRumours API.
 * Checks if the recipient supports MLS (has kind 443 key package) and
 * uses MLS when available, otherwise falls back to NIP-17.
 */

import * as nip17 from "$lib/nip17";
import {
  recipientSupportsMls,
  sendMlsMessage,
  subscribeToMlsMessages,
  getMlsMessageRumours,
  publishKeyPackage,
} from "$lib/mls-relay";

// Re-export unchanged functions from nip17
export {
  decrypt,
  getPreferredRelays,
  cacheRumour,
  getCachedChatList,
  setCachedChatList,
  getCachedUserInfo,
  setCachedUserInfo,
} from "$lib/nip17";

// Cache for MLS support checks
const mlsSupportCache = new Map<string, boolean>();

async function checkMlsSupport(pubkey: string): Promise<boolean> {
  if (mlsSupportCache.has(pubkey)) return mlsSupportCache.get(pubkey)!;
  try {
    const supported = await recipientSupportsMls(pubkey);
    console.log("[messaging] MLS support for", pubkey.slice(0, 12) + "…:", supported);
    mlsSupportCache.set(pubkey, supported);
    return supported;
  } catch (e) {
    console.warn("[messaging] MLS support check failed:", e);
    return false;
  }
}

/** Send a message — MLS if both parties support it, NIP-17 otherwise. */
export const send = async (message: string, user: any, recipient: any, expiryDays?: number) => {
  console.log("[messaging] send to", recipient.pubkey?.slice(0, 12) + "…", { self: user.pubkey === recipient.pubkey, expiry: !!expiryDays });
  if (user.pubkey !== recipient.pubkey && !expiryDays) {
    try {
      const peerSupports = await checkMlsSupport(recipient.pubkey);
      if (peerSupports) {
        console.log("[messaging] → MLS path");
        await sendMlsMessage(user, recipient.pubkey, message);
        return;
      }
      console.log("[messaging] → NIP-17 fallback (no MLS support)");
    } catch (e) {
      console.warn("[messaging] MLS send failed, falling back to NIP-17:", e);
    }
  }

  return nip17.send(message, user, recipient, expiryDays);
};

/** Get all message rumours — combines NIP-17 and MLS sources. */
export const getMessageRumours = async (user: any): Promise<any[]> => {
  const [nip17Rumours, mlsRumours] = await Promise.allSettled([
    nip17.getMessageRumours(user),
    getMlsMessageRumours(user),
  ]);

  const rumours: any[] = [];
  if (nip17Rumours.status === "fulfilled") rumours.push(...nip17Rumours.value);
  if (mlsRumours.status === "fulfilled") rumours.push(...mlsRumours.value);

  // Dedupe by id
  const seen = new Set<string>();
  return rumours.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
};

/** Subscribe to both NIP-17 and MLS incoming messages. Returns a close function. */
export const subscribeToMessages = async (
  user: any,
  onNewRumour: (rumour: any) => void,
): Promise<() => void> => {
  const closers: (() => void)[] = [];

  // NIP-17 subscription
  try {
    const closeNip17 = await nip17.subscribeToMessages(user, onNewRumour);
    closers.push(closeNip17);
  } catch (e) {
    console.error("[messaging] NIP-17 subscription failed:", e);
  }

  // MLS subscription
  try {
    const closeMls = await subscribeToMlsMessages(user, onNewRumour);
    closers.push(closeMls);
  } catch (e) {
    console.error("[messaging] MLS subscription failed:", e);
  }

  // Publish our key package so others can start MLS conversations with us
  publishKeyPackage(user).catch((e) =>
    console.warn("[messaging] Failed to publish MLS key package:", e),
  );

  return () => closers.forEach((c) => c());
};
