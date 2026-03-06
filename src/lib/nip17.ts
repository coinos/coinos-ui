import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

import { finalizeEvent, getEventHash, generateSecretKey, getPublicKey } from "nostr-tools/pure";
import { SimplePool } from "nostr-tools/pool";
import { Relay } from "nostr-tools/relay";
import { ensureSigner } from "$lib/nip07";
import { relaysSupporting } from "$lib/nip11";
import { expired, expiration } from "$lib/nip40";
import { encrypt, decrypt as nip44Decrypt, u } from "$lib/nip44";

const TWO_DAYS = 2 * 24 * 60 * 60;
const randomTimestamp = () => Math.floor(Date.now() / 1000 - Math.random() * TWO_DAYS);
const pool = new SimplePool();
let relayListCache = new Map();

import { PUBLIC_DM_RELAYS } from "$env/static/public";
const DM_RELAYS_LIST = PUBLIC_DM_RELAYS.split(",");
const DM_FETCH_LIMIT = 65536;

// Create a NIP-17 message using a provided sender secret key.
// If wrapPK is specified and different than receiverPK,
// the message will be gift-wrapped to wrapPK
// but the rumour will be sent to receiverPK.
// If expiryDays is specified, the message will expire in that many days,
// plus a random amount from 0 to 2 for security.
// (expiration time = random creation time + expiryDays + 2 days)
export const createNIP17MessageSK = (
  text: string,
  senderSK: Uint8Array,
  receiverPK: string,
  wrapPK: string | null = null,
  expiryDays: number | null = null,
) => {
  const rumour = createRumour(text, getPublicKey(senderSK), receiverPK);
  const sealed = sealRumourSK(rumour, senderSK, wrapPK || receiverPK, expiryDays);
  return giftWrap(sealed, wrapPK || receiverPK, expiryDays);
};

// Create a NIP-17 message using NIP-07, requiring no sender secret key.
// If wrapPK is specified and different than receiverPK,
// the message will be gift-wrapped to wrapPK
// but the rumour will be sent to receiverPK.
// If expiryDays is specified, the message will expire in that many days,
// plus a random amount from 0 to 2 for security.
// (expiration time = random creation time + expiryDays + 2 days)
export const createNIP17MessageNIP07 = async (
  text: string,
  senderPK: string,
  receiverPK: string,
  wrapPK: string | null = null,
  expiryDays: number | null = null,
) => {
  const rumour = createRumour(text, senderPK, receiverPK);
  const sealed = await sealRumourNip07(rumour, wrapPK || receiverPK, expiryDays);
  return giftWrap(sealed, wrapPK || receiverPK, expiryDays);
};

const createRumour = (text: string, senderPK: string, receiverPK: string) => {
  const rumour: any = {
    kind: 14, // rumour
    created_at: Math.floor(Date.now() / 1000),
    tags: [["p", receiverPK]],
    pubkey: senderPK,
    content: text,
  };
  rumour.id = getEventHash(rumour); // do NOT sign rumours!
  return rumour;
};

const sealRumourSK = (
  rumour: any,
  senderSK: Uint8Array,
  receiverPK: string,
  expiryDays: number | null = null,
) => {
  const senderSKString = bytesToHex(senderSK);
  const conversationKey = u.getConversationKey(senderSKString, receiverPK);
  const encryptedRumour = encrypt(JSON.stringify(rumour), conversationKey);

  const created = randomTimestamp();
  const sealEvent: any = {
    kind: 13, // seal
    created_at: created,
    tags: [],
    pubkey: getPublicKey(senderSK),
    content: encryptedRumour,
  };
  if (expiryDays != null) {
    const expiration = created + (expiryDays + 2) * 86400;
    sealEvent.tags.push(["expiration", expiration.toString()]);
  }

  return finalizeEvent(sealEvent, senderSK);
};

const sealRumourNip07 = async (
  rumour: any,
  receiverPK: string,
  expiryDays: number | null = null,
) => {
  const encryptedRumour = await (window as any).nostr.nip44.encrypt(
    receiverPK,
    JSON.stringify(rumour),
  );

  const created = randomTimestamp();
  const sealEvent: any = {
    kind: 13, // seal
    created_at: created,
    tags: [],
    content: encryptedRumour,
  };
  if (expiryDays != null) {
    const expiration = created + (expiryDays + 2) * 86400;
    sealEvent.tags.push(["expiration", expiration.toString()]);
  }

  return (window as any).nostr.signEvent(sealEvent);
};

const giftWrap = (event: any, receiverPK: string, expiryDays: number | null = null) => {
  const secretKey = generateSecretKey();
  const conversationKey = u.getConversationKey(bytesToHex(secretKey), receiverPK);
  const encryptedEvent = encrypt(JSON.stringify(event), conversationKey);
  const created = randomTimestamp();

  const giftWrapEvent: any = {
    kind: 1059, // gift wrap
    created_at: created,
    tags: [["p", receiverPK]],
    pubkey: getPublicKey(secretKey),
    content: encryptedEvent,
  };
  if (expiryDays != null) {
    const expiration = created + (expiryDays + 2) * 86400;
    giftWrapEvent.tags.push(["expiration", expiration.toString()]);
  }

  return finalizeEvent(giftWrapEvent, secretKey);
};

const decryptNIP17MessageNIP07 = async (wrapped: any): Promise<any> => {
  const sealedText = await (window as any).nostr.nip44.decrypt(wrapped.pubkey, wrapped.content);
  const sealed = JSON.parse(sealedText);
  const rumourText = await (window as any).nostr.nip44.decrypt(sealed.pubkey, sealed.content);
  return JSON.parse(rumourText);
};

// Decrypts the provided message, addressed to the user.
// If NIP-07 is available, it uses that, otherwise it triggers the signer modal.
export const decrypt = async (wrapped: any, user: any): Promise<any> => {
  const sk = await ensureSigner(user.pubkey);

  if (sk === null) {
    return decryptNIP17MessageNIP07(wrapped);
  } else {
    const skHex = bytesToHex(sk);
    const derivedPK = getPublicKey(sk);
    if (derivedPK !== user.pubkey) {
      console.error("[nip17] KEY MISMATCH: sk derives", derivedPK, "but user.pubkey is", user.pubkey);
    }
    const sealedText = nip44Decrypt(wrapped.content, u.getConversationKey(skHex, wrapped.pubkey));
    const sealed = JSON.parse(sealedText);
    const rumourText = nip44Decrypt(sealed.content, u.getConversationKey(skHex, sealed.pubkey));
    return JSON.parse(rumourText);
  }
};

// In-memory cache for rumours, keyed by pubkey
let rumourCache = new Map<string, any[]>();

const fetchMessageRumours = async (user: any): Promise<any[]> => {
  const preferredRelays = await getPreferredRelays(user.pubkey);
  // Always include default relays to catch messages that might be there
  const relays = Array.from(new Set([...preferredRelays, ...DM_RELAYS_LIST]));
  const wrapped = await pool.querySync(relays, {
    kinds: [1059],
    "#p": [user.pubkey],
    limit: DM_FETCH_LIMIT,
  });

  let rumours: any[] = [];
  // intentionally decrypting sequentially to avoid having a bunch of popups
  for (const event of wrapped) {
    if (expired(event)) {
      console.log("relay(s) contain expired event", event.id);
      continue;
    }

    try {
      const rumour: any = await decrypt(event, user);

      // Skip non-DM rumours (e.g. MLS welcomes that share kind 1059 gift wraps)
      if (rumour.kind && rumour.kind !== 14) continue;

      const expires = expiration(event);
      if (expires) {
        rumour.expiration = expires;
      }

      rumours.push(rumour);
    } catch (e) {
      console.error("Failed to decrypt event:", event.id, e);
    }
  }

  rumourCache.set(user.pubkey, rumours);
  return rumours;
};

// Returns the rumours of the messages the provided user has sent or received.
// If the events have an expiration timestamp,
// that timestamp is added to its rumour object as the property `expiration`.
// Returns cached results immediately if available, and refreshes in the background.
export const getMessageRumours = async (user: any): Promise<any[]> => {
  const cached = rumourCache.get(user.pubkey);
  if (cached) {
    fetchMessageRumours(user);
    return cached;
  }
  return fetchMessageRumours(user);
};

// Cache for computed chat lists and user info
let chatListCache = new Map<string, { chats: any[]; rumours: any[] }>();
let userInfoCache = new Map<string, any>();

export const getCachedChatList = (userPubkey: string) => chatListCache.get(userPubkey);
export const setCachedChatList = (userPubkey: string, chats: any[], rumours: any[]) => {
  chatListCache.set(userPubkey, { chats, rumours });
};

export const getCachedUserInfo = (pubkey: string) => userInfoCache.get(pubkey);
export const setCachedUserInfo = (pubkey: string, info: any) => {
  userInfoCache.set(pubkey, info);
};

// Add a rumour to the cache (used by subscription handlers)
export const cacheRumour = (userPubkey: string, rumour: any) => {
  const cached = rumourCache.get(userPubkey);
  if (cached && !cached.find((r: any) => r.id === rumour.id)) {
    cached.push(rumour);
  }
};

// Returns the preferred relays of the user with the provided pubkey,
// according to their kind-10050 event.
export const getPreferredRelays = async (pubkey: string): Promise<string[]> => {
  if (relayListCache.has(pubkey)) return relayListCache.get(pubkey);

  const events = await pool.querySync(DM_RELAYS_LIST, {
    kinds: [10050],
    limit: 1,
    authors: [pubkey],
  });

  let relays: string[] = [];
  for (const event of events) {
    for (const tag of event.tags) {
      if (tag.length >= 2 && tag[0] == "relay") {
        relays.push(tag[1]);
      }
    }
  }

  // Fall back to default DM relays if user hasn't published their preferred relays
  if (relays.length === 0) {
    relays = DM_RELAYS_LIST;
  }

  relayListCache.set(pubkey, relays);
  return relays;
};

// Publish to a single relay with NIP-42 auth support
const publishWithAuth = async (
  relayUrl: string,
  event: any,
  sk: Uint8Array | null,
): Promise<string> => {
  const relay = await Relay.connect(relayUrl);

  const signAuthEvent = async (authEvent: any) => {
    if (sk) {
      return finalizeEvent(authEvent, sk);
    } else if ((window as any).nostr) {
      return await (window as any).nostr.signEvent(authEvent);
    }
    throw new Error("No signing method for auth");
  };

  try {
    return await relay.publish(event);
  } catch (e: any) {
    // Check if it's an auth error
    if (e?.message?.includes("auth-required")) {
      // Authenticate and retry
      await relay.auth(signAuthEvent);
      return await relay.publish(event);
    }
    throw e;
  }
};

// Store the current sk for use in publish
let currentSk: Uint8Array | null = null;

const publishToPreferred = async (
  event: any,
  pubkey: string,
  expiryEnabled: boolean,
): Promise<string> => {
  let preferredRelays = await getPreferredRelays(pubkey);
  if (expiryEnabled) {
    preferredRelays = await relaysSupporting(preferredRelays, [40]);
  }
  console.log("[nip17] publishing to relays for", pubkey, ":", preferredRelays);
  if (preferredRelays.length === 0) {
    throw new Error("No relays available to publish to");
  }

  const promises = preferredRelays.map((url) => publishWithAuth(url, event, currentSk));
  try {
    return await (Promise as any).any(promises);
  } catch (e) {
    const results = await Promise.allSettled(promises);
    console.error("All relay publishes failed:", results);
    throw e;
  }
};

const createAndPublishMessageEvent = async (
  sk: Uint8Array | null,
  message: string,
  userPK: string,
  recipientPK: string,
  eventFor: string,
  expiryDays?: number,
) => {
  let event;
  if (sk === null) {
    event = await createNIP17MessageNIP07(message, userPK, recipientPK, eventFor, expiryDays);
  } else {
    event = createNIP17MessageSK(message, sk, recipientPK, eventFor, expiryDays);
  }
  return publishToPreferred(event, eventFor, expiryDays != null);
};

// Subscribes to new incoming gift wraps for the user.
// Decrypts new events and passes the rumour to onNewRumour().
// Returns a close function to stop the subscription.
// Uses Relay directly instead of SimplePool.subscribeMany to avoid
// a filter double-nesting bug in nostr-tools v2.23.0.
export const subscribeToMessages = async (
  user: any,
  onNewRumour: (rumour: any) => void,
): Promise<() => void> => {
  const preferredRelays = await getPreferredRelays(user.pubkey);
  const relayUrls = Array.from(new Set([...preferredRelays, ...DM_RELAYS_LIST]));
  const since = Math.floor(Date.now() / 1000) - TWO_DAYS;
  const seen = new Set<string>();
  let eoseCount = 0;

  const closers: (() => void)[] = [];

  for (const url of relayUrls) {
    try {
      const relay = await Relay.connect(url);
      const sub = relay.subscribe(
        [{ kinds: [1059], "#p": [user.pubkey], since }],
        {
          onevent: async (event) => {
            if (seen.has(event.id)) return;
            seen.add(event.id);
            if (eoseCount < relayUrls.length) return;
            if (expired(event)) return;
            try {
              const rumour: any = await decrypt(event, user);
              // Skip non-DM rumours (e.g. MLS welcomes that share kind 1059 gift wraps)
              if (rumour.kind && rumour.kind !== 14) return;
              const expires = expiration(event);
              if (expires) rumour.expiration = expires;
              console.log("[nip17] new rumour from", rumour.pubkey?.slice(0, 12) + "…:", rumour.content?.slice(0, 40));
              onNewRumour(rumour);
            } catch (e) {
              console.error("[nip17] Failed to decrypt subscription event:", event.id, e);
            }
          },
          oneose: () => {
            eoseCount++;
            console.log("[nip17] EOSE", eoseCount + "/" + relayUrls.length, "from", url);
          },
        },
      );
      closers.push(() => sub.close());
    } catch (e) {
      console.error("Failed to connect to relay for subscription:", url, e);
      eoseCount++;
    }
  }

  return () => closers.forEach((close) => close());
};

// Lightweight count of new gift wraps since a timestamp (no decryption needed).
export const countNewGiftWraps = async (pubkey: string, since: number): Promise<number> => {
  const events = await pool.querySync(DM_RELAYS_LIST, {
    kinds: [1059],
    "#p": [pubkey],
    since,
    limit: 100,
  });
  return events.length;
};

// Sends a NIP-17 message from `user` to `recipient`.
// If expiryDays is set, messages will expire after that many days.
export const send = async (message: string, user: any, recipient: any, expiryDays?: number) => {
  const sk = await ensureSigner(user.pubkey);

  // Store sk for auth handler
  currentSk = sk;

  if (user.pubkey === recipient.pubkey) {
    return createAndPublishMessageEvent(
      sk,
      message,
      user.pubkey,
      recipient.pubkey,
      user.pubkey,
      expiryDays,
    );
  } else {
    const p1 = createAndPublishMessageEvent(
      sk,
      message,
      user.pubkey,
      recipient.pubkey,
      recipient.pubkey,
      expiryDays,
    );
    const p2 = createAndPublishMessageEvent(
      sk,
      message,
      user.pubkey,
      recipient.pubkey,
      user.pubkey,
      expiryDays,
    );
    return Promise.all([p1, p2]);
  }
};
