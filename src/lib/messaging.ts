/**
 * Messaging facade — MLS groups only.
 *
 * Every conversation is an MLS group (1:1 DMs are 2-person groups).
 */

export {
  publishKeyPackage,
  fetchKeyPackage,
  searchMlsUsers,
  preloadMlsUsers,
  getGroups,
  getGroupRumours,
  sendGroupMessage,
  findOrCreateDmGroup,
  subscribeToMessages,
  fetchGroupHistory,
  decryptMediaUrl,
} from "$lib/mls-relay";

export type { GroupInfo } from "$lib/mls-relay";

import { getNostrUserInfo } from "$lib/nip01";
import { isValid } from "nostr-tools/nip05";

// ---------------------------------------------------------------------------
// User info cache (shared across pages)
// ---------------------------------------------------------------------------

const userInfoCache = new Map<string, any>();

export function getCachedUserInfo(pubkey: string): any | null {
  return userInfoCache.get(pubkey) ?? null;
}

export function setCachedUserInfo(pubkey: string, info: any): void {
  userInfoCache.set(pubkey, info);
}

/** Resolve a pubkey to user info (coinos user, nostr profile, or anonymous). */
export async function resolveUser(pubkey: string): Promise<any> {
  const cached = userInfoCache.get(pubkey);
  if (cached) return cached;

  const nostrUserInfo = (await getNostrUserInfo(pubkey)) || {};
  const valid = "nip05" in nostrUserInfo && (await isValid(pubkey, nostrUserInfo.nip05));

  let coinosUsername = null;
  let picture = nostrUserInfo?.picture || null;
  try {
    const response = await fetch(`/api/users/${pubkey}`);
    if (response.ok) {
      const info = await response.json();
      if (!info.anon) {
        coinosUsername = info.username || null;
        picture = info.picture || picture;
      }
    }
  } catch {}

  const info = {
    coinosUsername,
    picture,
    nostrName: nostrUserInfo?.name || null,
    nip05: nostrUserInfo?.nip05 || null,
    nip05Valid: valid,
    pubkey,
  };
  userInfoCache.set(pubkey, info);
  return info;
}

/** Get a display name for a user info object. */
export function displayName(info: any): string {
  return info?.coinosUsername || info?.nostrName || "Anonymous";
}
