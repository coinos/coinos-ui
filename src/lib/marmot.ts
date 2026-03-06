/**
 * Marmot protocol integration: MarmotClient setup, storage backends,
 * signer adapter, and network adapter.
 *
 * Uses @internet-privacy/marmot-ts which wraps ts-mls with Nostr-specific
 * MIP-00/01/02/03 protocol handling.
 */

import type { EventTemplate, NostrEvent, UnsignedEvent } from "nostr-tools/pure";
import { finalizeEvent } from "nostr-tools/pure";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { SimplePool } from "nostr-tools/pool";
import { Relay } from "nostr-tools/relay";
import {
  MarmotClient,
  KeyPackageStore,
  InviteReader,
} from "@internet-privacy/marmot-ts";
import type {
  NostrNetworkInterface,
  PublishResponse,
  Subscribable,
  GroupStateStoreBackend,
  SerializedClientState,
  StoredKeyPackage,
} from "@internet-privacy/marmot-ts";
import { ensureSigner } from "$lib/nip07";
import { encrypt as nip44Encrypt, decrypt as nip44Decrypt, u as nip44u } from "$lib/nip44";
import { PUBLIC_DM_RELAYS } from "$env/static/public";

/** Key-value store interface matching marmot-ts's KeyValueStoreBackend */
interface KVStore<T> {
  getItem(key: string): Promise<T | null>;
  setItem(key: string, value: T): Promise<T>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

const DM_RELAYS = PUBLIC_DM_RELAYS.split(",");
const pool = new SimplePool();

// ---------------------------------------------------------------------------
// EventSigner adapter — bridges our ensureSigner/NIP-07 to applesauce interface
// ---------------------------------------------------------------------------

class CoinosEventSigner {
  private pubkey: string;

  constructor(pubkey: string) {
    this.pubkey = pubkey;
  }

  getPublicKey(): string {
    return this.pubkey;
  }

  async signEvent(draft: EventTemplate | UnsignedEvent): Promise<NostrEvent> {
    const sk = await ensureSigner(this.pubkey);
    if (sk === null) {
      return (window as any).nostr.signEvent(draft);
    }
    return finalizeEvent(draft as any, sk);
  }

  nip44 = {
    encrypt: async (pubkey: string, plaintext: string): Promise<string> => {
      const sk = await ensureSigner(this.pubkey);
      if (sk === null) {
        return (window as any).nostr.nip44.encrypt(pubkey, plaintext);
      }
      const skHex = bytesToHex(sk);
      const ckey = nip44u.getConversationKey(skHex, pubkey);
      return nip44Encrypt(plaintext, ckey);
    },
    decrypt: async (pubkey: string, ciphertext: string): Promise<string> => {
      const sk = await ensureSigner(this.pubkey);
      if (sk === null) {
        return (window as any).nostr.nip44.decrypt(pubkey, ciphertext);
      }
      const skHex = bytesToHex(sk);
      const ckey = nip44u.getConversationKey(skHex, pubkey);
      return nip44Decrypt(ciphertext, ckey);
    },
  };
}

// ---------------------------------------------------------------------------
// NostrNetworkInterface adapter — bridges SimplePool to marmot-ts
// ---------------------------------------------------------------------------

class CoinosNostrNetwork implements NostrNetworkInterface {
  async publish(relays: string[], event: NostrEvent): Promise<Record<string, PublishResponse>> {
    const results: Record<string, PublishResponse> = {};
    await Promise.allSettled(
      relays.map(async (url) => {
        try {
          const relay = await Relay.connect(url);
          await relay.publish(event);
          results[url] = { from: url, ok: true };
        } catch (e: any) {
          results[url] = { from: url, ok: false, message: e?.message };
        }
      }),
    );
    return results;
  }

  async request(relays: string[], filters: any): Promise<NostrEvent[]> {
    if (Array.isArray(filters)) {
      return pool.querySync(relays, filters[0], ...filters.slice(1)) as any;
    }
    return pool.querySync(relays, filters) as any;
  }

  subscription(relays: string[], filters: any): Subscribable<NostrEvent> {
    const filterArr = Array.isArray(filters) ? filters : [filters];

    return {
      subscribe(observer) {
        const subs: (() => void)[] = [];

        for (const url of relays) {
          Relay.connect(url)
            .then((relay) => {
              const sub = relay.subscribe(filterArr, {
                onevent: (event) => observer.next?.(event as NostrEvent),
                oneose: () => {},
              });
              subs.push(() => sub.close());
            })
            .catch((e) => observer.error?.(e));
        }

        return {
          unsubscribe() {
            subs.forEach((close) => close());
          },
        };
      },
    };
  }

  async getUserInboxRelays(pubkey: string): Promise<string[]> {
    // Fetch kind 10050 (NIP-17 inbox relays) or fall back to DM_RELAYS
    try {
      const events = await pool.querySync(DM_RELAYS, {
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
    } catch {}
    return DM_RELAYS;
  }
}

// ---------------------------------------------------------------------------
// IndexedDB-backed KeyValueStoreBackend
// ---------------------------------------------------------------------------

const IDB_NAME = "coinos-marmot";
const IDB_VERSION = 1;

function openMarmotDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("group-state")) {
        db.createObjectStore("group-state");
      }
      if (!db.objectStoreNames.contains("key-packages")) {
        db.createObjectStore("key-packages");
      }
      if (!db.objectStoreNames.contains("invites-received")) {
        db.createObjectStore("invites-received");
      }
      if (!db.objectStoreNames.contains("invites-unread")) {
        db.createObjectStore("invites-unread");
      }
      if (!db.objectStoreNames.contains("invites-seen")) {
        db.createObjectStore("invites-seen");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Generic IndexedDB key-value backend for marmot-ts stores. */
function createIDBKeyValueStore<T>(storeName: string): KVStore<T> {
  return {
    async getItem(key: string): Promise<T | null> {
      const db = await openMarmotDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const req = tx.objectStore(storeName).get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      });
    },
    async setItem(key: string, value: T): Promise<T> {
      const db = await openMarmotDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        tx.objectStore(storeName).put(value, key);
        tx.oncomplete = () => resolve(value);
        tx.onerror = () => reject(tx.error);
      });
    },
    async removeItem(key: string): Promise<void> {
      const db = await openMarmotDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        tx.objectStore(storeName).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    },
    async clear(): Promise<void> {
      const db = await openMarmotDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        tx.objectStore(storeName).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    },
    async keys(): Promise<string[]> {
      const db = await openMarmotDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const req = tx.objectStore(storeName).getAllKeys();
        req.onsuccess = () => resolve(req.result.map(String));
        req.onerror = () => reject(req.error);
      });
    },
  };
}

// ---------------------------------------------------------------------------
// GroupStateStoreBackend (uses Uint8Array keys, needs special handling)
// ---------------------------------------------------------------------------

class IDBGroupStateBackend implements GroupStateStoreBackend {
  private storeName = "group-state";

  private keyToStr(groupId: Uint8Array): string {
    return bytesToHex(groupId);
  }

  async get(groupId: Uint8Array): Promise<SerializedClientState | null> {
    const db = await openMarmotDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readonly");
      const req = tx.objectStore(this.storeName).get(this.keyToStr(groupId));
      req.onsuccess = () => {
        const result = req.result;
        if (!result) return resolve(null);
        resolve(result instanceof Uint8Array ? result : new Uint8Array(result));
      };
      req.onerror = () => reject(req.error);
    });
  }

  async set(groupId: Uint8Array, stateBytes: SerializedClientState): Promise<void> {
    const db = await openMarmotDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      tx.objectStore(this.storeName).put(stateBytes, this.keyToStr(groupId));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async remove(groupId: Uint8Array): Promise<void> {
    const db = await openMarmotDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      tx.objectStore(this.storeName).delete(this.keyToStr(groupId));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async list(): Promise<Uint8Array[]> {
    const db = await openMarmotDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readonly");
      const req = tx.objectStore(this.storeName).getAllKeys();
      req.onsuccess = () => resolve(req.result.map((k) => hexToBytes(String(k))));
      req.onerror = () => reject(req.error);
    });
  }
}

// ---------------------------------------------------------------------------
// Singleton MarmotClient + InviteReader
// ---------------------------------------------------------------------------

let _client: MarmotClient | null = null;
let _inviteReader: InviteReader | null = null;
let _currentPubkey: string | null = null;
const _network = new CoinosNostrNetwork();

export function getMarmotClient(pubkey: string): MarmotClient {
  if (_client && _currentPubkey === pubkey) return _client;

  // Tear down old client if user changed
  _client = null;
  _inviteReader = null;
  _currentPubkey = pubkey;

  const signer = new CoinosEventSigner(pubkey);
  const groupStateBackend = new IDBGroupStateBackend();
  const keyPackageBackend = createIDBKeyValueStore<StoredKeyPackage>("key-packages") as any;
  const keyPackageStore = new KeyPackageStore(keyPackageBackend);

  _client = new MarmotClient({
    signer,
    groupStateBackend,
    keyPackageStore,
    network: _network,
  });

  return _client;
}

export function getInviteReader(pubkey: string): InviteReader {
  if (_inviteReader && _currentPubkey === pubkey) return _inviteReader;

  // Ensure client is initialized
  getMarmotClient(pubkey);

  const signer = new CoinosEventSigner(pubkey);
  const store = {
    received: createIDBKeyValueStore("invites-received"),
    unread: createIDBKeyValueStore("invites-unread"),
    seen: createIDBKeyValueStore("invites-seen"),
  } as any;

  _inviteReader = new InviteReader({ signer, store });
  return _inviteReader;
}

export function getNetwork(): CoinosNostrNetwork {
  return _network;
}

export { DM_RELAYS };
