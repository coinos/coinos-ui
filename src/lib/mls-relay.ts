/**
 * MLS relay layer using marmot-ts: subscribes to kinds 443/1059/445,
 * manages key packages, and bridges MLS messages into the existing chat UI.
 *
 * Produces "rumour-like" objects so the UI can consume them alongside NIP-17.
 */

import type { NostrEvent } from "nostr-tools/pure";
import { bytesToHex } from "@noble/hashes/utils.js";
import { SimplePool } from "nostr-tools/pool";
import { Relay } from "nostr-tools/relay";

import { getMarmotClient, getInviteReader, getNetwork, DM_RELAYS } from "$lib/marmot";

const pool = new SimplePool();

// In-memory caches
const peerGroupMap = new Map<string, string>(); // pubkey -> mlsGroupIdHex
const groupPeerMap = new Map<string, string>(); // mlsGroupIdHex -> pubkey
const nostrIdToMlsId = new Map<string, string>(); // nostrGroupIdHex -> mlsGroupIdHex
let mlsRumourCache: any[] = [];
const processedEventIds = new Set<string>();

/** Load cached rumours and processed event IDs from localStorage */
function loadLocalCache(): void {
  try {
    const cached = localStorage.getItem("mls:rumours");
    if (cached) {
      const arr = JSON.parse(cached);
      if (Array.isArray(arr)) mlsRumourCache = arr;
    }
    const ids = localStorage.getItem("mls:processedEvents");
    if (ids) {
      for (const id of JSON.parse(ids)) processedEventIds.add(id);
    }
  } catch {}
}

/** Save rumour cache and processed event IDs to localStorage */
function saveLocalCache(): void {
  try {
    localStorage.setItem("mls:rumours", JSON.stringify(mlsRumourCache));
    localStorage.setItem("mls:processedEvents", JSON.stringify([...processedEventIds]));
  } catch {}
}

/** Get the nostr group ID (used in h tags) from a MarmotGroup */
function getNostrGroupId(group: any): string {
  const data = group.groupData;
  if (data?.nostrGroupId) return bytesToHex(data.nostrGroupId);
  // Fallback to MLS group ID if no marmot data
  return bytesToHex(group.id);
}

/** Register the mapping between nostr group ID and MLS group ID */
function registerGroupIds(group: any): void {
  const nostrId = getNostrGroupId(group);
  const mlsId = bytesToHex(group.id);
  nostrIdToMlsId.set(nostrId, mlsId);
}

// Active subscription state — allows adding group subscriptions dynamically
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

/** Publish our MLS key package to relays so others can invite us to groups. */
export async function publishKeyPackage(user: any, relays: string[] = DM_RELAYS): Promise<void> {
  const client = getMarmotClient(user.pubkey);
  await client.keyPackages.create({ relays, client: "coinos/marmot-ts" });
}

/** Fetch a recipient's key package event from relays (kind 443). */
export async function fetchKeyPackage(pubkey: string, relays: string[] = DM_RELAYS): Promise<NostrEvent | null> {
  const events = await pool.querySync(relays, {
    kinds: [443],
    authors: [pubkey],
    limit: 1,
  });
  if (events.length === 0) return null;
  return events.sort((a, b) => b.created_at - a.created_at)[0] as NostrEvent;
}

/** Check if a recipient supports MLS (has a kind 443 key package). */
export async function recipientSupportsMls(pubkey: string, relays: string[] = DM_RELAYS): Promise<boolean> {
  const kp = await fetchKeyPackage(pubkey, relays);
  return kp !== null;
}

// ---------------------------------------------------------------------------
// Starting an MLS conversation (1:1 = 2-person group)
// ---------------------------------------------------------------------------

/** Start an MLS DM with a recipient. Creates group and sends welcome via NIP-59. */
export async function startMlsConversation(
  user: any,
  recipientPubkey: string,
  relays: string[] = DM_RELAYS,
): Promise<any> {
  // Check if we already have a group with this user
  const existingGroupId = peerGroupMap.get(recipientPubkey);
  if (existingGroupId) {
    const client = getMarmotClient(user.pubkey);
    try {
      return await client.getGroup(existingGroupId);
    } catch {}
  }

  // Fetch recipient's key package
  const kpEvent = await fetchKeyPackage(recipientPubkey, relays);
  if (!kpEvent) {
    throw new Error("Recipient has no MLS key package published");
  }

  // Use relays from the key package event so the recipient can see our commits/welcomes
  const kpRelaysTag = kpEvent.tags.find((t: string[]) => t[0] === "relays");
  const groupRelays = kpRelaysTag ? kpRelaysTag.slice(1) : relays;

  // Create group and invite recipient
  const client = getMarmotClient(user.pubkey);
  const group = await client.createGroup("", { relays: groupRelays });

  // Invite by key package event — handles Add proposal, Commit, Welcome delivery via NIP-59
  await group.inviteByKeyPackageEvent(kpEvent);

  // Register IDs and store peer mapping
  registerGroupIds(group);
  const mlsGroupIdHex = bytesToHex(group.id);
  storePeerGroupMapping(recipientPubkey, mlsGroupIdHex);

  // Subscribe to this new group's messages using nostr group ID
  subscribeToGroup(getNostrGroupId(group));

  return group;
}

// ---------------------------------------------------------------------------
// Sending MLS messages
// ---------------------------------------------------------------------------

/** Send a message via MLS. */
export async function sendMlsMessage(
  user: any,
  recipientPubkey: string,
  message: string,
  relays: string[] = DM_RELAYS,
): Promise<void> {
  let mlsGroupIdHex = peerGroupMap.get(recipientPubkey);

  if (!mlsGroupIdHex) {
    const group = await startMlsConversation(user, recipientPubkey, relays);
    mlsGroupIdHex = bytesToHex(group.id);
  }

  const client = getMarmotClient(user.pubkey);
  const group = await client.getGroup(mlsGroupIdHex!);
  await group.sendChatMessage(message);

  // Add to local cache as a rumour-like object
  const rumour = makeRumour(message, user.pubkey, recipientPubkey);
  mlsRumourCache.push(rumour);
  saveLocalCache();
}

// ---------------------------------------------------------------------------
// Dynamic group subscription — subscribe to a single group on existing relays
// ---------------------------------------------------------------------------

/** Subscribe to a group's messages. Uses the nostr group ID (h tag value). */
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

/** Subscribe to MLS events for the user. Returns a close function. */
export async function subscribeToMlsMessages(
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

  // Set up active subscription state for dynamic group adds
  _activeSub = { user, relays, seen, onNewRumour, subscribedGroups, closers, connectedRelays };

  // Load all known groups and register their ID mappings
  await client.loadAllGroups();
  const allRelayUrls = new Set(relays);
  for (const g of client.groups) {
    registerGroupIds(g);
    const r = g.relays;
    if (r) r.forEach((url: string) => allRelayUrls.add(url));
  }

  // Listen for new invites (welcomes via NIP-59)
  inviteReader.on("newInvite", async (invite) => {
    try {
      const { group } = await client.joinGroupFromWelcome({ welcomeRumor: invite });
      registerGroupIds(group);
      const mlsGroupIdHex = bytesToHex(group.id);
      const senderPubkey = invite.pubkey;
      storePeerGroupMapping(senderPubkey, mlsGroupIdHex);
      // Subscribe to this newly joined group's messages
      subscribeToGroup(getNostrGroupId(group));
    } catch (e) {
      console.error("[mls-relay] Failed to join from welcome:", e);
    }
  });

  for (const url of allRelayUrls) {
    try {
      const relay = await Relay.connect(url);
      connectedRelays.push(relay);

      // Subscribe to gift wraps (kind 1059) addressed to us — welcomes arrive via NIP-59
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

      // Subscribe to messages for all groups we're already in (kind 445)
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

    // Skip already-processed events
    if (processedEventIds.has(event.id)) return null;

    // Resolve nostr group ID to MLS group ID for client.getGroup()
    const mlsGroupIdHex = nostrIdToMlsId.get(nostrGroupIdHex);
    if (!mlsGroupIdHex) return null;

    let group;
    try {
      group = await client.getGroup(mlsGroupIdHex);
    } catch {
      return null;
    }

    // Use MarmotGroup.ingest to process the event
    for await (const result of group.ingest([event])) {
      if (result.kind === "processed" && result.result.kind === "applicationMessage") {
        const raw = new TextDecoder().decode(result.result.message);
        let content: string;
        let senderPubkey: string;
        try {
          const rumor = JSON.parse(raw);
          content = rumor.content ?? raw;
          senderPubkey = rumor.pubkey ?? (groupPeerMap.get(mlsGroupIdHex) || event.pubkey);
        } catch {
          content = raw;
          senderPubkey = groupPeerMap.get(mlsGroupIdHex) || event.pubkey;
        }

        // Skip self-echo — we already cached our own messages locally at send time
        if (senderPubkey === user.pubkey) {
          processedEventIds.add(event.id);
          saveLocalCache();
          await group.save();
          return null;
        }

        const recipientPubkey = user.pubkey;

        const rumour = makeRumour(content, senderPubkey, recipientPubkey);
        rumour._mls = true;
        rumour._groupId = mlsGroupIdHex;
        mlsRumourCache.push(rumour);
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

/** Fetch MLS messages the user has received. Returns rumour-like objects. */
export async function getMlsMessageRumours(user: any, relays: string[] = DM_RELAYS): Promise<any[]> {
  // Load from localStorage on first call
  if (mlsRumourCache.length === 0) loadLocalCache();
  if (mlsRumourCache.length > 0) return mlsRumourCache;

  const client = getMarmotClient(user.pubkey);
  await client.loadAllGroups();

  const groups = client.groups;
  if (groups.length === 0) return [];

  // Register ID mappings and collect nostr group IDs for h tag queries
  const hTags: string[] = [];
  for (const g of groups) {
    registerGroupIds(g);
    hTags.push(getNostrGroupId(g));
  }

  // Also query the group's own relays, not just DM_RELAYS
  const groupRelays = new Set(relays);
  for (const g of groups) {
    const r = g.relays;
    if (r) r.forEach((url: string) => groupRelays.add(url));
  }

  // Fetch kind 445 events
  const events = await pool.querySync([...groupRelays], {
    kinds: [445],
    "#h": hTags,
    limit: 1000,
  });

  // Sort chronologically and process
  events.sort((a, b) => a.created_at - b.created_at);

  for (const event of events) {
    const rumour = await handleGroupMessageEvent(event as NostrEvent, user, client);
    if (rumour) mlsRumourCache.push(rumour);
  }
  return mlsRumourCache;
}

// ---------------------------------------------------------------------------
// Peer <-> Group mapping (localStorage)
// ---------------------------------------------------------------------------

function storePeerGroupMapping(peerPubkey: string, mlsGroupId: string): void {
  peerGroupMap.set(peerPubkey, mlsGroupId);
  groupPeerMap.set(mlsGroupId, peerPubkey);
  try {
    const key = "mls:peer2group";
    const map = JSON.parse(localStorage.getItem(key) || "{}");
    map[peerPubkey] = mlsGroupId;
    localStorage.setItem(key, JSON.stringify(map));

    const rkey = "mls:group2peer";
    const rmap = JSON.parse(localStorage.getItem(rkey) || "{}");
    rmap[mlsGroupId] = peerPubkey;
    localStorage.setItem(rkey, JSON.stringify(rmap));
  } catch {}
}

// Restore peer mappings from localStorage on load
function restorePeerMappings(): void {
  try {
    const map = JSON.parse(localStorage.getItem("mls:peer2group") || "{}");
    for (const [k, v] of Object.entries(map)) {
      peerGroupMap.set(k, v as string);
    }
    const rmap = JSON.parse(localStorage.getItem("mls:group2peer") || "{}");
    for (const [k, v] of Object.entries(rmap)) {
      groupPeerMap.set(k, v as string);
    }
  } catch {}
}
restorePeerMappings();
loadLocalCache();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create a rumour-like object compatible with the existing chat UI. */
function makeRumour(content: string, senderPubkey: string, recipientPubkey: string): any {
  return {
    id: bytesToHex(crypto.getRandomValues(new Uint8Array(32))),
    kind: 14,
    created_at: Math.floor(Date.now() / 1000),
    pubkey: senderPubkey,
    content,
    tags: [["p", recipientPubkey]],
    _mls: true,
  };
}
