/**
 * MLS relay layer using marmot-ts: subscribes to kinds 443/1059/445,
 * manages key packages, and provides group-based messaging.
 */

import type { NostrEvent } from "nostr-tools/pure";
import { bytesToHex } from "@noble/hashes/utils.js";
import { nip19 } from "nostr-tools";
import { SimplePool } from "nostr-tools/pool";
import { Relay } from "nostr-tools/relay";
import { getMarmotClient, getInviteReader, DM_RELAYS } from "$lib/marmot";
import { parseMediaImetaTag } from "@internet-privacy/marmot-ts";
import { BlossomClient } from "nostr-tools/nipb7";
import { ensureSigner } from "$lib/nip07";
import { post } from "$lib/utils";

const BLOSSOM_SERVER = "https://blossom.primal.net";

const pool = new SimplePool();

/** Extract member pubkeys from an MLS group's ratchet tree (pass group.state). */
function getGroupMembers(state: any): string[] {
  if (!state?.ratchetTree) return [];
  const pubkeys = new Set<string>();
  for (const node of state.ratchetTree) {
    if (!node?.leaf?.credential?.identity) continue;
    const identity = node.leaf.credential.identity;
    const hex = identity instanceof Uint8Array
      ? bytesToHex(identity)
      : typeof identity === "string" ? identity
      : bytesToHex(new Uint8Array(identity));
    // identity may be 32 raw bytes (-> 64 hex) or already 64 hex chars
    if (hex.length === 64) pubkeys.add(hex);
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

const CACHE_VERSION = 2; // bump to clear stale caches (v1 lacked tags)

function loadLocalCache(userPubkey?: string): void {
  if (userPubkey) _cacheUserPubkey = userPubkey;
  const pk = _cacheUserPubkey;
  if (!pk) return;
  try {
    const ver = localStorage.getItem(`mls:cacheVersion:${pk}`);
    if (ver !== String(CACHE_VERSION)) {
      // Stale cache — clear it so messages are re-fetched with current code
      localStorage.removeItem(`mls:groupRumours:${pk}`);
      localStorage.removeItem(`mls:processedEvents:${pk}`);
      localStorage.setItem(`mls:cacheVersion:${pk}`, String(CACHE_VERSION));
      return;
    }
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
// Connection status tracking
// ---------------------------------------------------------------------------

let _connectionListeners: ((connected: boolean) => void)[] = [];
let _isConnected = false;

export function isConnected(): boolean {
  return _isConnected;
}

export function onConnectionChange(cb: (connected: boolean) => void): () => void {
  _connectionListeners.push(cb);
  return () => {
    _connectionListeners = _connectionListeners.filter((l) => l !== cb);
  };
}

function _updateConnectionStatus(): void {
  if (!_activeSub) {
    if (_isConnected) {
      _isConnected = false;
      _connectionListeners.forEach((cb) => cb(false));
    }
    return;
  }
  const connected = _activeSub.connectedRelays.some((r: any) => r.connected);
  if (connected !== _isConnected) {
    _isConnected = connected;
    _connectionListeners.forEach((cb) => cb(connected));
  }
}

/** Fetch recent messages to catch up after disconnect or background period. */
export async function catchUpMessages(): Promise<void> {
  if (!_activeSub) return;
  const { user, seen, onNewRumour } = _activeSub;
  const client = getMarmotClient(user.pubkey);

  try {
    await client.loadAllGroups();
    const groups = client.groups;
    if (groups.length === 0) return;

    const hTags: string[] = [];
    const catchUpRelays = new Set(_activeSub.relays);
    for (const g of groups) {
      registerGroupIds(g);
      hTags.push(getNostrGroupId(g));
      const r = g.relays;
      if (r) r.forEach((url: string) => catchUpRelays.add(url));
    }

    const since = Math.floor(Date.now() / 1000) - 300;
    const events = await pool.querySync([...catchUpRelays], {
      kinds: [445],
      "#h": hTags,
      since,
      limit: 200,
    });

    events.sort((a, b) => a.created_at - b.created_at);

    let newCount = 0;
    for (const event of events) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      const rumour = await handleGroupMessageEvent(
        event as NostrEvent,
        user,
        client,
      );
      if (rumour) {
        onNewRumour(rumour);
        newCount++;
      }
    }
    if (newCount > 0)
      console.log(`[mls] caught up ${newCount} missed messages`);
  } catch (e) {
    console.error("[mls] catch-up failed:", e);
  }
}

// ---------------------------------------------------------------------------
// Key package management (kind 443)
// ---------------------------------------------------------------------------

export async function publishKeyPackage(user: any, relays: string[] = DM_RELAYS): Promise<void> {
  console.log("[mls] publishKeyPackage to", relays);
  const client = getMarmotClient(user.pubkey);
  await client.keyPackages.create({ relays, client: "coinos/marmot-ts" });
}

const DISCOVERY_RELAYS = [
  ...DM_RELAYS,
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://nos.lol",
  "wss://purplepag.es",
];

async function getInboxRelays(pubkey: string): Promise<string[]> {
  const events = await pool.querySync(DISCOVERY_RELAYS, {
    kinds: [10050],
    authors: [pubkey],
    limit: 1,
  });
  if (events.length > 0) {
    const relays = events[0].tags
      .filter((t: string[]) => t[0] === "relay")
      .map((t: string[]) => t[1]);
    if (relays.length > 0) return relays;
  }
  return [];
}

// ---------------------------------------------------------------------------
// MLS user directory — IndexedDB-cached profiles of kind 443 authors
// ---------------------------------------------------------------------------

interface MlsUserProfile {
  pubkey: string;
  name?: string;
  picture?: string;
  nip05?: string;
}

const MLS_DB_NAME = "coinos-mls-directory";
const MLS_DB_VERSION = 1;
const MLS_STORE = "profiles";
let _mlsDb: IDBDatabase | null = null;
let _mlsLoading: Promise<void> | null = null;

function openMlsDb(): Promise<IDBDatabase> {
  if (_mlsDb) return Promise.resolve(_mlsDb);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(MLS_DB_NAME, MLS_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(MLS_STORE)) {
        const store = db.createObjectStore(MLS_STORE, { keyPath: "pubkey" });
        store.createIndex("name", "name");
      }
    };
    req.onsuccess = () => { _mlsDb = req.result; resolve(_mlsDb); };
    req.onerror = () => reject(req.error);
  });
}

/** Fetch MLS user directory from server, cache in IndexedDB. */
export function preloadMlsUsers(): Promise<void> {
  if (_mlsLoading) return _mlsLoading;
  _mlsLoading = (async () => {
    const db = await openMlsDb();

    // Check if we've fetched recently
    const meta = await new Promise<any>((resolve) => {
      const tx = db.transaction(MLS_STORE, "readonly");
      const req = tx.objectStore(MLS_STORE).get("__meta__");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
    if (meta?.lastFetch && Date.now() - meta.lastFetch < 10 * 60 * 1000) return;

    try {
      const res = await fetch("/api/mls/users");
      if (!res.ok) return;
      const users: MlsUserProfile[] = await res.json();

      const tx = db.transaction(MLS_STORE, "readwrite");
      const store = tx.objectStore(MLS_STORE);
      store.clear();
      for (const u of users) store.put(u);
      store.put({ pubkey: "__meta__", lastFetch: Date.now() });
      await new Promise<void>((resolve) => { tx.oncomplete = () => resolve(); });
    } catch {}
  })();
  return _mlsLoading;
}

/** Resolve a hex pubkey to an MLS profile if they have a key package. */
async function lookupMlsUser(pubkey: string): Promise<MlsUserProfile | null> {
  const kp = await fetchKeyPackage(pubkey);
  if (!kp) return null;
  const profiles = await pool.querySync(DISCOVERY_RELAYS, { kinds: [0], authors: [pubkey], limit: 1 });
  let name: string | undefined, picture: string | undefined, nip05Val: string | undefined;
  if (profiles.length) {
    try {
      const p = JSON.parse(profiles[0].content);
      name = p.display_name || p.name;
      picture = p.picture;
      nip05Val = p.nip05;
    } catch {}
  }
  const profile: MlsUserProfile = { pubkey, name, picture, nip05: nip05Val };

  // Cache in IndexedDB for future searches
  try {
    const db = await openMlsDb();
    const tx = db.transaction(MLS_STORE, "readwrite");
    tx.objectStore(MLS_STORE).put(profile);
  } catch {}

  return profile;
}

/** Search MLS users from local IndexedDB. Falls back to relay lookup for npub/pubkey. */
export async function searchMlsUsers(query: string): Promise<MlsUserProfile[]> {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();

  // If query looks like an npub or hex pubkey, do a direct lookup
  let directPubkey: string | null = null;
  if (q.startsWith("npub1")) {
    try { directPubkey = nip19.decode(q).data as string; } catch {}
  } else if (/^[0-9a-f]{64}$/.test(q)) {
    directPubkey = q;
  }

  const db = await openMlsDb();
  const all: MlsUserProfile[] = await new Promise((resolve, reject) => {
    const tx = db.transaction(MLS_STORE, "readonly");
    const req = tx.objectStore(MLS_STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  const results = all.filter((u) => {
    if (u.pubkey === "__meta__") return false;
    const name = (u.name || "").toLowerCase();
    const nip05 = (u.nip05 || "").toLowerCase();
    return name.includes(q) || nip05.includes(q) || u.pubkey.startsWith(q);
  }).slice(0, 20);

  // If no local results and we have a direct pubkey, check relays
  if (results.length === 0 && directPubkey) {
    const profile = await lookupMlsUser(directPubkey);
    if (profile) return [profile];
  }

  return results;
}

export async function fetchKeyPackage(pubkey: string, relays: string[] = DM_RELAYS): Promise<NostrEvent | null> {
  const inboxRelays = await getInboxRelays(pubkey);
  const allRelays = [...new Set([...inboxRelays, ...relays, ...DISCOVERY_RELAYS])];
  const events = await pool.querySync(allRelays, {
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

/** Sync group metadata to the server so it can send push notifications for kind 445 events. */
function syncGroupsToServer(groups: { nostrGroupId: string; members: string[]; relays: string[] }[]): void {
  if (!groups.length) return;
  post("/groups/sync", { groups }).catch(() => {});
}

/** Load all groups and return metadata for the chat list. */
export async function getGroups(user: any): Promise<GroupInfo[]> {
  const client = getMarmotClient(user.pubkey);
  await client.loadAllGroups();

  // Ensure caches are loaded
  if (!_cacheUserPubkey) loadLocalCache(user.pubkey);

  const infos: GroupInfo[] = [];
  const syncPayload: { nostrGroupId: string; members: string[]; relays: string[] }[] = [];

  for (const g of client.groups) {
    registerGroupIds(g);
    const groupId = bytesToHex(g.id);
    const nostrGroupId = getNostrGroupId(g);
    const data = g.groupData;
    const members = getGroupMembers(g.state);
    const relays = data?.relays || g.relays || [];
    const rumours = groupRumourCache.get(groupId) || [];
    const last = rumours.length > 0 ? rumours[rumours.length - 1] : null;

    infos.push({
      groupId,
      name: data?.name || "",
      members,
      adminPubkeys: data?.adminPubkeys || [],
      relays,
      lastMessage: last?.content,
      lastMessageAt: last?.created_at,
    });

    syncPayload.push({ nostrGroupId, members, relays });
  }

  // Sort by most recent message
  infos.sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));

  // Sync group registry to server for push notifications
  syncGroupsToServer(syncPayload);

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

/** Send a media message (image/video/audio) to a group. */
export async function sendGroupMediaMessage(
  user: any,
  groupId: string,
  file: File | Blob,
): Promise<void> {
  const client = getMarmotClient(user.pubkey);
  const group = await client.getGroup(groupId);

  const mime = file.type || "application/octet-stream";
  const filename = file instanceof File ? file.name : "file";

  // Encrypt with MLS group key
  const { encrypted, attachment } = await group.encryptMedia(file, {
    type: mime,
    filename,
  });

  // Upload encrypted blob to blossom
  const sk = await ensureSigner(user.pubkey);
  const signer = sk
    ? {
        getPublicKey: () => user.pubkey,
        signEvent: async (draft: any) => {
          const { finalizeEvent } = await import("nostr-tools/pure");
          return finalizeEvent(draft, sk);
        },
      }
    : (window as any).nostr;

  const blossom = new BlossomClient(BLOSSOM_SERVER, signer);
  const encryptedBlob = new Blob([encrypted as BlobPart], { type: "application/octet-stream" });
  const desc = await blossom.uploadBlob(encryptedBlob);

  // Build imeta tag with the upload URL and MIP-04 fields
  const imetaTag = [
    "imeta",
    `url ${desc.url}`,
    `m ${attachment.type}`,
    `x ${attachment.sha256}`,
    `filename ${attachment.filename}`,
    `n ${attachment.nonce}`,
    `v ${attachment.version}`,
  ];
  if (attachment.size) imetaTag.push(`size ${attachment.size}`);

  // Pre-cache plaintext so the image renders instantly for us
  await putCachedMedia(attachment.sha256, file, mime);

  // Send as chat message with the imeta tag
  await group.sendChatMessage("", [imetaTag]);

  const rumour = makeRumour("", user.pubkey, groupId, [imetaTag]);
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
  const allRelayUrls = new Set([...relays, ...DISCOVERY_RELAYS]);
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

  // Fetch historical welcomes so we join groups created while we were offline
  try {
    const historicalWraps = await pool.querySync(relays, {
      kinds: [1059],
      "#p": [user.pubkey],
      limit: 100,
    });
    for (const event of historicalWraps) {
      try {
        const ingested = await inviteReader.ingestEvent(event as NostrEvent);
        if (ingested) await inviteReader.decryptGiftWraps();
      } catch {}
    }
    // Re-load groups after processing welcomes
    await client.loadAllGroups();
    for (const g of client.groups) {
      registerGroupIds(g);
      const r = g.relays;
      if (r) r.forEach((url: string) => allRelayUrls.add(url));
    }
  } catch (e) {
    console.error("[mls] Failed to fetch historical welcomes:", e);
  }

  // Pre-compute group subscription filters
  const groups = client.groups;
  const hTags: string[] = [];
  for (const g of groups) {
    const nostrId = getNostrGroupId(g);
    subscribedGroups.add(nostrId);
    hTags.push(nostrId);
  }

  // Connect to relays in parallel with auto-reconnect
  const setupRelay = async (url: string) => {
    try {
      const relay = await Relay.connect(url, {
        enableReconnect: true,
        timeout: 5000,
      });
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

      if (hTags.length > 0) {
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
      console.warn("[mls-relay] Failed to connect:", url);
    }
  };

  await Promise.allSettled([...allRelayUrls].map(setupRelay));
  _updateConnectionStatus();

  // Catch up on missed messages when tab becomes visible again
  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      _updateConnectionStatus();
      catchUpMessages();
    }
  };
  document.addEventListener("visibilitychange", handleVisibility);
  closers.push(() =>
    document.removeEventListener("visibilitychange", handleVisibility),
  );

  // Listen for push-delivered events from service worker
  if (typeof navigator !== "undefined" && navigator.serviceWorker) {
    const handleSWMessage = async (evt: MessageEvent) => {
      if (evt.data?.type !== "mls-event") return;
      try {
        const event = JSON.parse(evt.data.event);
        if (seen.has(event.id)) return;
        seen.add(event.id);
        const rumour = await handleGroupMessageEvent(
          event as NostrEvent,
          user,
          client,
        );
        if (rumour) onNewRumour(rumour);
      } catch (e) {
        console.error("[mls] Failed to process push event:", e);
      }
    };
    navigator.serviceWorker.addEventListener("message", handleSWMessage);
    closers.push(() =>
      navigator.serviceWorker.removeEventListener("message", handleSWMessage),
    );
  }

  // Publish key package
  publishKeyPackage(user).catch((e) =>
    console.warn("[mls] Failed to publish key package:", e),
  );

  return () => {
    _activeSub = null;
    _updateConnectionStatus();
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
        let tags: string[][] = [];
        try {
          const rumor = JSON.parse(raw);
          content = rumor.content ?? raw;
          senderPubkey = rumor.pubkey ?? event.pubkey;
          if (Array.isArray(rumor.tags)) tags = rumor.tags;
          console.log("[mls] decoded rumor:", { content: content?.slice(0, 100), tags, keys: Object.keys(rumor) });
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

        const rumour = makeRumour(content, senderPubkey, mlsGroupIdHex, tags);
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
  const inviteReader = getInviteReader(user.pubkey);

  // Process any pending welcomes first so we know about all our groups
  try {
    const wraps = await pool.querySync(relays, {
      kinds: [1059],
      "#p": [user.pubkey],
      limit: 100,
    });
    for (const event of wraps) {
      try {
        const ingested = await inviteReader.ingestEvent(event as NostrEvent);
        if (ingested) await inviteReader.decryptGiftWraps();
      } catch {}
    }
  } catch (e) {
    console.error("[mls] Failed to fetch welcomes in history:", e);
  }

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

function makeRumour(content: string, senderPubkey: string, groupId: string, tags: string[][] = []): any {
  return {
    id: bytesToHex(crypto.getRandomValues(new Uint8Array(32))),
    kind: 14,
    created_at: Math.floor(Date.now() / 1000),
    pubkey: senderPubkey,
    content,
    tags,
    _groupId: groupId,
  };
}

function cacheGroupRumour(groupId: string, rumour: any): void {
  const existing = groupRumourCache.get(groupId) || [];
  existing.push(rumour);
  groupRumourCache.set(groupId, existing);
  saveLocalCache();
}

// ---------------------------------------------------------------------------
// MIP-04 media decryption
// ---------------------------------------------------------------------------

const MEDIA_CACHE_NAME = "coinos-media-v1";
const _mediaBlobCache = new Map<string, string>(); // sha256 → blob URL (in-memory)

async function getCachedMedia(sha256: string, mime: string): Promise<string | null> {
  if (_mediaBlobCache.has(sha256)) return _mediaBlobCache.get(sha256)!;
  try {
    const cache = await caches.open(MEDIA_CACHE_NAME);
    const resp = await cache.match(`/media/${sha256}`);
    if (!resp) return null;
    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);
    _mediaBlobCache.set(sha256, blobUrl);
    return blobUrl;
  } catch {
    return null;
  }
}

async function putCachedMedia(sha256: string, data: BlobPart, mime: string): Promise<string> {
  const blob = new Blob([data], { type: mime });
  const blobUrl = URL.createObjectURL(blob);
  _mediaBlobCache.set(sha256, blobUrl);
  try {
    const cache = await caches.open(MEDIA_CACHE_NAME);
    await cache.put(`/media/${sha256}`, new Response(blob.slice()));
  } catch {}
  return blobUrl;
}

/**
 * Decrypt a MIP-04 encrypted media attachment and return a blob URL.
 * Results are cached in the Cache API (persists across page loads).
 */
export async function decryptMediaUrl(groupId: string, tag: string[]): Promise<string> {
  const attachment = parseMediaImetaTag(tag);
  if (!attachment) throw new Error("Invalid MIP-04 imeta tag");

  const cached = await getCachedMedia(attachment.sha256, attachment.type);
  if (cached) return cached;

  const userPubkey = _cacheUserPubkey;
  if (!userPubkey) throw new Error("No user pubkey");

  const client = getMarmotClient(userPubkey);
  const group = await client.getGroup(groupId);

  // Fetch encrypted blob from blossom
  const url = attachment.url;
  if (!url) throw new Error("No URL in attachment");
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
  const encryptedBytes = new Uint8Array(await resp.arrayBuffer());

  // Decrypt using group's MLS epoch key
  const { data } = await group.decryptMedia(encryptedBytes, attachment);

  return putCachedMedia(attachment.sha256, data as BlobPart, attachment.type);
}
