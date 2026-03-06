/**
 * MLS relay layer using marmot-ts: subscribes to kinds 443/1059/445,
 * manages key packages, and provides group-based messaging.
 */

import type { NostrEvent } from "nostr-tools/pure";
import { bytesToHex } from "@noble/hashes/utils.js";
import { SimplePool } from "nostr-tools/pool";
import { Relay } from "nostr-tools/relay";
import { getMarmotClient, getInviteReader, DM_RELAYS } from "$lib/marmot";

const pool = new SimplePool();

/** Extract member pubkeys from an MLS group's ratchet tree. */
function getGroupMembers(group: any): string[] {
  const state = group.state;
  if (!state?.ratchetTree) return [];
  const pubkeys = new Set<string>();
  for (const node of state.ratchetTree) {
    if (node?.nodeType === 1 && node.leaf?.credential?.credentialType === 0) {
      // Basic credential: identity is the pubkey bytes
      const identity = node.leaf.credential.identity;
      if (identity) {
        const hex = typeof identity === "string"
          ? identity
          : bytesToHex(new Uint8Array(identity));
        if (hex.length === 64) pubkeys.add(hex);
      }
    }
  }
  return Array.from(pubkeys);
}

// ID mappings
const nostrIdToMlsId = new Map<string, string>();

// Rumour cache keyed by group
const groupRumourCache = new Map<string, any[]>();
const processedEventIds = new Set<string>();
let _cacheUserPubkey: string | null = null;

/** Group metadata exposed to the UI */
export interface GroupInfo {
  groupId: string;
  name: string;
  members: string[];       // member pubkeys
  adminPubkeys: string[];
  relays: string[];
  lastMessage?: string;
  lastMessageAt?: number;
}

// ---------------------------------------------------------------------------
// LocalStorage cache (per-user)
// ---------------------------------------------------------------------------

function loadLocalCache(userPubkey?: string): void {
  if (userPubkey) _cacheUserPubkey = userPubkey;
  const pk = _cacheUserPubkey;
  if (!pk) return;
  try {
    const cached = localStorage.getItem(`mls:groupRumours:${pk}`);
    if (cached) {
      const obj = JSON.parse(cached);
      for (const [gid, rumours] of Object.entries(obj)) {
        if (Array.isArray(rumours)) groupRumourCache.set(gid, rumours as any[]);
      }
    }
    const ids = localStorage.getItem(`mls:processedEvents:${pk}`);
    if (ids) {
      for (const id of JSON.parse(ids)) processedEventIds.add(id);
    }
  } catch {}
}

function saveLocalCache(): void {
  const pk = _cacheUserPubkey;
  if (!pk) return;
  try {
    const obj: Record<string, any[]> = {};
    for (const [gid, rumours] of groupRumourCache) obj[gid] = rumours;
    localStorage.setItem(`mls:groupRumours:${pk}`, JSON.stringify(obj));
    localStorage.setItem(`mls:processedEvents:${pk}`, JSON.stringify([...processedEventIds]));
  } catch {}
}

// ---------------------------------------------------------------------------
// Group ID helpers
// ---------------------------------------------------------------------------

function getNostrGroupId(group: any): string {
  const data = group.groupData;
  if (data?.nostrGroupId) return bytesToHex(data.nostrGroupId);
  return bytesToHex(group.id);
}

function registerGroupIds(group: any): void {
  const nostrId = getNostrGroupId(group);
  const mlsId = bytesToHex(group.id);
  nostrIdToMlsId.set(nostrId, mlsId);
}

// ---------------------------------------------------------------------------
// Active subscription state
// ---------------------------------------------------------------------------

let _activeSub: {
  user: any;
  relays: string[];
  seen: Set<string>;
  onNewRumour: (rumour: any) => void;
  subscribedGroups: Set<string>;
  closers: (() => void)[];
  connectedRelays: any[];
} | null = null;

// ---------------------------------------------------------------------------
// Key package management (kind 443)
// ---------------------------------------------------------------------------

export async function publishKeyPackage(user: any, relays: string[] = DM_RELAYS): Promise<void> {
  console.log("[mls] publishKeyPackage to", relays);
  const client = getMarmotClient(user.pubkey);
  await client.keyPackages.create({ relays, client: "coinos/marmot-ts" });
}

export async function fetchKeyPackage(pubkey: string, relays: string[] = DM_RELAYS): Promise<NostrEvent | null> {
  const events = await pool.querySync(relays, {
    kinds: [443],
    authors: [pubkey],
    limit: 1,
  });
  if (events.length === 0) return null;
  return events.sort((a, b) => b.created_at - a.created_at)[0] as NostrEvent;
}

// ---------------------------------------------------------------------------
// Group listing
// ---------------------------------------------------------------------------

/** Load all groups and return metadata for the chat list. */
export async function getGroups(user: any): Promise<GroupInfo[]> {
  const client = getMarmotClient(user.pubkey);
  await client.loadAllGroups();

  // Ensure caches are loaded
  if (!_cacheUserPubkey) loadLocalCache(user.pubkey);

  const infos: GroupInfo[] = [];
  for (const g of client.groups) {
    registerGroupIds(g);
    const groupId = bytesToHex(g.id);
    const data = g.groupData;
    const members = getGroupMembers(g.state);
    const rumours = groupRumourCache.get(groupId) || [];
    const last = rumours.length > 0 ? rumours[rumours.length - 1] : null;

    infos.push({
      groupId,
      name: data?.name || "",
      members,
      adminPubkeys: data?.adminPubkeys || [],
      relays: data?.relays || g.relays || [],
      lastMessage: last?.content,
      lastMessageAt: last?.created_at,
    });
  }

  // Sort by most recent message
  infos.sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
  return infos;
}

/** Get rumours for a specific group. */
export function getGroupRumours(groupId: string): any[] {
  return groupRumourCache.get(groupId) || [];
}

// ---------------------------------------------------------------------------
// Starting a conversation (creates a 2-person group)
// ---------------------------------------------------------------------------

/** Find an existing DM group with a peer, or create one. Returns the group ID. */
export async function findOrCreateDmGroup(
  user: any,
  recipientPubkey: string,
  relays: string[] = DM_RELAYS,
): Promise<string> {
  const client = getMarmotClient(user.pubkey);
  await client.loadAllGroups();

  // Check existing groups for a 2-person group with this peer
  for (const g of client.groups) {
    const members = getGroupMembers(g.state);
    if (members.length === 2 && members.includes(recipientPubkey) && members.includes(user.pubkey)) {
      return bytesToHex(g.id);
    }
  }

  // Create a new group
  const kpEvent = await fetchKeyPackage(recipientPubkey, relays);
  if (!kpEvent) {
    throw new Error("Recipient has no MLS key package published");
  }

  const kpRelaysTag = kpEvent.tags.find((t: string[]) => t[0] === "relays");
  const groupRelays = kpRelaysTag ? kpRelaysTag.slice(1) : relays;

  const group = await client.createGroup("", { relays: groupRelays });
  await group.inviteByKeyPackageEvent(kpEvent);

  registerGroupIds(group);
  const groupId = bytesToHex(group.id);
  subscribeToGroup(getNostrGroupId(group));

  return groupId;
}

// ---------------------------------------------------------------------------
// Sending messages
// ---------------------------------------------------------------------------

/** Send a message to a group by MLS group ID. */
export async function sendGroupMessage(
  user: any,
  groupId: string,
  message: string,
): Promise<void> {
  const client = getMarmotClient(user.pubkey);
  const group = await client.getGroup(groupId);
  await group.sendChatMessage(message);

  const rumour = makeRumour(message, user.pubkey, groupId);
  cacheGroupRumour(groupId, rumour);
}

// ---------------------------------------------------------------------------
// Dynamic group subscription
// ---------------------------------------------------------------------------

function subscribeToGroup(nostrGroupIdHex: string): void {
  if (!_activeSub) return;
  if (_activeSub.subscribedGroups.has(nostrGroupIdHex)) return;

  _activeSub.subscribedGroups.add(nostrGroupIdHex);
  const { seen, onNewRumour, closers, connectedRelays, user } = _activeSub;
  const client = getMarmotClient(user.pubkey);

  for (const relay of connectedRelays) {
    try {
      const sub = relay.subscribe(
        [{ kinds: [445], "#h": [nostrGroupIdHex] }],
        {
          onevent: async (event: any) => {
            if (seen.has(event.id)) return;
            seen.add(event.id);
            const rumour = await handleGroupMessageEvent(event as NostrEvent, user, client);
            if (rumour) onNewRumour(rumour);
          },
        },
      );
      closers.push(() => sub.close());
    } catch {}
  }
}

// ---------------------------------------------------------------------------
// Subscription: listen for welcomes (kind 1059) and messages (kind 445)
// ---------------------------------------------------------------------------

export async function subscribeToMessages(
  user: any,
  onNewRumour: (rumour: any) => void,
  relays: string[] = DM_RELAYS,
): Promise<() => void> {
  const client = getMarmotClient(user.pubkey);
  const inviteReader = getInviteReader(user.pubkey);
  const closers: (() => void)[] = [];
  const seen = new Set<string>();
  const subscribedGroups = new Set<string>();
  const connectedRelays: any[] = [];

  _activeSub = { user, relays, seen, onNewRumour, subscribedGroups, closers, connectedRelays };

  _cacheUserPubkey = user.pubkey;
  loadLocalCache(user.pubkey);

  await client.loadAllGroups();
  const allRelayUrls = new Set(relays);
  for (const g of client.groups) {
    registerGroupIds(g);
    const r = g.relays;
    if (r) r.forEach((url: string) => allRelayUrls.add(url));
  }

  // Listen for new invites (welcomes via NIP-59)
  inviteReader.on("newInvite", async (invite) => {
    console.log("[mls] received welcome from", invite.pubkey?.slice(0, 12) + "…");
    try {
      const { group } = await client.joinGroupFromWelcome({ welcomeRumor: invite });
      registerGroupIds(group);
      const groupId = bytesToHex(group.id);
      console.log("[mls] joined group", groupId.slice(0, 16), "from", invite.pubkey?.slice(0, 12));
      subscribeToGroup(getNostrGroupId(group));
    } catch (e) {
      console.error("[mls] Failed to join from welcome:", e);
    }
  });

  for (const url of allRelayUrls) {
    try {
      const relay = await Relay.connect(url);
      connectedRelays.push(relay);

      const welcomeSub = relay.subscribe(
        [{ kinds: [1059], "#p": [user.pubkey] }],
        {
          onevent: async (event) => {
            if (seen.has(event.id)) return;
            seen.add(event.id);
            try {
              const ingested = await inviteReader.ingestEvent(event as NostrEvent);
              if (ingested) {
                await inviteReader.decryptGiftWraps();
              }
            } catch {}
          },
        },
      );
      closers.push(() => welcomeSub.close());

      const groups = client.groups;
      if (groups.length > 0) {
        const hTags: string[] = [];
        for (const g of groups) {
          const nostrId = getNostrGroupId(g);
          subscribedGroups.add(nostrId);
          hTags.push(nostrId);
        }
        const msgSub = relay.subscribe(
          [{ kinds: [445], "#h": hTags }],
          {
            onevent: async (event) => {
              if (seen.has(event.id)) return;
              seen.add(event.id);
              const rumour = await handleGroupMessageEvent(event as NostrEvent, user, client);
              if (rumour) onNewRumour(rumour);
            },
          },
        );
        closers.push(() => msgSub.close());
      }
    } catch (e) {
      console.error("[mls-relay] Failed to connect:", url, e);
    }
  }

  // Publish key package
  publishKeyPackage(user).catch((e) =>
    console.warn("[mls] Failed to publish key package:", e),
  );

  return () => {
    _activeSub = null;
    inviteReader.removeAllListeners("newInvite");
    closers.forEach((c) => c());
  };
}

// ---------------------------------------------------------------------------
// Handle incoming kind 445 group messages
// ---------------------------------------------------------------------------

async function handleGroupMessageEvent(
  event: NostrEvent,
  user: any,
  client: any,
): Promise<any | null> {
  try {
    const hTag = event.tags.find((t: string[]) => t[0] === "h");
    if (!hTag) return null;
    const nostrGroupIdHex = hTag[1];

    if (processedEventIds.has(event.id)) return null;

    const mlsGroupIdHex = nostrIdToMlsId.get(nostrGroupIdHex);
    if (!mlsGroupIdHex) {
      console.warn("[mls] unknown nostr group ID:", nostrGroupIdHex.slice(0, 16));
      return null;
    }

    let group;
    try {
      group = await client.getGroup(mlsGroupIdHex);
    } catch {
      return null;
    }

    for await (const result of group.ingest([event])) {
      if (result.kind === "processed" && result.result.kind === "applicationMessage") {
        const raw = new TextDecoder().decode(result.result.message);
        let content: string;
        let senderPubkey: string;
        try {
          const rumor = JSON.parse(raw);
          content = rumor.content ?? raw;
          senderPubkey = rumor.pubkey ?? event.pubkey;
        } catch {
          content = raw;
          senderPubkey = event.pubkey;
        }

        // Skip self-echo
        if (senderPubkey === user.pubkey) {
          processedEventIds.add(event.id);
          saveLocalCache();
          await group.save();
          return null;
        }

        const rumour = makeRumour(content, senderPubkey, mlsGroupIdHex);
        cacheGroupRumour(mlsGroupIdHex, rumour);
        processedEventIds.add(event.id);
        saveLocalCache();

        await group.save();
        return rumour;
      }
    }

    processedEventIds.add(event.id);
    saveLocalCache();
    await group.save();
    return null;
  } catch (e) {
    console.error("[mls-relay] Failed to process group message:", event.id, e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fetch historical MLS messages
// ---------------------------------------------------------------------------

export async function fetchGroupHistory(user: any, relays: string[] = DM_RELAYS): Promise<void> {
  const client = getMarmotClient(user.pubkey);
  await client.loadAllGroups();

  const groups = client.groups;
  if (groups.length === 0) return;

  const hTags: string[] = [];
  for (const g of groups) {
    registerGroupIds(g);
    hTags.push(getNostrGroupId(g));
  }

  const groupRelays = new Set(relays);
  for (const g of groups) {
    const r = g.relays;
    if (r) r.forEach((url: string) => groupRelays.add(url));
  }

  const events = await pool.querySync([...groupRelays], {
    kinds: [445],
    "#h": hTags,
    limit: 1000,
  });

  events.sort((a, b) => a.created_at - b.created_at);

  for (const event of events) {
    await handleGroupMessageEvent(event as NostrEvent, user, client);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRumour(content: string, senderPubkey: string, groupId: string): any {
  return {
    id: bytesToHex(crypto.getRandomValues(new Uint8Array(32))),
    kind: 14,
    created_at: Math.floor(Date.now() / 1000),
    pubkey: senderPubkey,
    content,
    tags: [],
    _groupId: groupId,
  };
}

function cacheGroupRumour(groupId: string, rumour: any): void {
  const existing = groupRumourCache.get(groupId) || [];
  existing.push(rumour);
  groupRumourCache.set(groupId, existing);
  saveLocalCache();
}
