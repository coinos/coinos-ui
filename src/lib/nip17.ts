import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

import { finalizeEvent, getEventHash, generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { SimplePool } from 'nostr-tools/pool';
import { Relay } from 'nostr-tools/relay';
import { unwrapEvent } from 'nostr-tools/nip17';

import { relaysSupporting } from '$lib/nip11';
import { expired, expiration } from '$lib/nip40';
import { encrypt, u } from '$lib/nip44';
import { eventToSign, signer } from '$lib/store';
import { get } from 'svelte/store';

const TWO_DAYS = 2 * 24 * 60 * 60;
const randomTimestamp = () => Math.floor(
    Date.now() / 1000 - Math.random() * TWO_DAYS);
const pool = new SimplePool();
let relayListCache = new Map();

import { PUBLIC_DM_RELAYS } from '$env/static/public';
const DM_RELAYS_LIST = PUBLIC_DM_RELAYS.split(',');
const DM_FETCH_LIMIT = 256;

// Ensures we have access to a secret key, triggering the signer modal if needed.
// Returns the sk as Uint8Array, or null if using NIP-07 extension.
const ensureSigner = async (userPubkey: string): Promise<Uint8Array | null> => {
    // Check if NIP-07 extension is available and matches user
    if (window.nostr) {
        try {
            const extPubkey = await window.nostr.getPublicKey();
            if (extPubkey === userPubkey) {
                return null; // Use NIP-07
            }
        } catch (e) {
            // Extension didn't work, fall through to signer
        }
    }

    // Check if signer already has a valid sk (64 hex chars = 32 bytes)
    const currentSigner = get(signer);
    if (currentSigner?.ready && currentSigner?.params?.sk && currentSigner.params.sk.length === 64) {
        return hexToBytes(currentSigner.params.sk);
    }

    // Clear invalid signer state before triggering modal
    if (currentSigner?.ready && (!currentSigner?.params?.sk || currentSigner.params.sk.length !== 64)) {
        signer.set(undefined);
    }

    // Trigger the signer modal with a dummy event
    const dummyEvent = { kind: 14, content: 'DM encryption', tags: [], created_at: Math.floor(Date.now() / 1000) };
    eventToSign.set(dummyEvent);

    // Wait for signer to be ready
    const signerValue = await new Promise<any>((resolve, reject) => {
        let unsubscribe: () => void;
        unsubscribe = signer.subscribe((v) => {
            if (v === 'cancel') {
                setTimeout(() => unsubscribe?.());
                eventToSign.set(null);
                reject(new Error('cancelled'));
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
    if (signerValue?.method === 'extension') {
        return null; // Use NIP-07
    }

    throw new Error('No signing method available');
}

// Create a NIP-17 message using a provided sender secret key.
// If wrapPK is specified and different than receiverPK,
// the message will be gift-wrapped to wrapPK
// but the rumour will be sent to receiverPK.
// If expiryDays is specified, the message will expire in that many days,
// plus a random amount from 0 to 2 for security.
// (expiration time = random creation time + expiryDays + 2 days)
export const createNIP17MessageSK = (text: string, senderSK: Uint8Array, receiverPK: string, wrapPK: string = null, expiryDays: number = null) => {
    const rumour = createRumour(text, getPublicKey(senderSK), receiverPK);
    const sealed = sealRumourSK(rumour, senderSK, wrapPK || receiverPK, expiryDays);
    return giftWrap(sealed, wrapPK || receiverPK, expiryDays);
}

// Create a NIP-17 message using NIP-07, requiring no sender secret key.
// If wrapPK is specified and different than receiverPK,
// the message will be gift-wrapped to wrapPK
// but the rumour will be sent to receiverPK.
// If expiryDays is specified, the message will expire in that many days,
// plus a random amount from 0 to 2 for security.
// (expiration time = random creation time + expiryDays + 2 days)
export const createNIP17MessageNIP07 = async (text: string, senderPK: string, receiverPK: string, wrapPK: string = null, expiryDays: number = null) => {
    const rumour = createRumour(text, senderPK, receiverPK);
    const sealed = await sealRumourNip07(rumour, wrapPK || receiverPK, expiryDays);
    return giftWrap(sealed, wrapPK || receiverPK, expiryDays);
}

const createRumour = (text: string, senderPK: string, receiverPK: string) => {
    const rumour = {
        kind: 14, // rumour
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", receiverPK]],
        pubkey: senderPK,
        content: text
    };
    rumour.id = getEventHash(rumour); // do NOT sign rumours!
    return rumour;
}

const sealRumourSK = (rumour: object, senderSK: Uint8Array, receiverPK: string, expiryDays: number = null) => {
    const senderSKString = bytesToHex(senderSK);
    const conversationKey = u.getConversationKey(senderSKString, receiverPK);
    const encryptedRumour = encrypt(JSON.stringify(rumour), conversationKey);

    const created = randomTimestamp();
    const sealEvent = {
        kind: 13, // seal
        created_at: created,
        tags: [],
        pubkey: getPublicKey(senderSK),
        content: encryptedRumour
    }
    if (expiryDays != null) {
        const expiration = created + (expiryDays + 2) * 86400;
        sealEvent.tags.push(["expiration", expiration.toString()]);
    }

    return finalizeEvent(sealEvent, senderSK);
}

const sealRumourNip07 = async (rumour: object, receiverPK: string, expiryDays: number = null) => {
    const encryptedRumour = await window.nostr.nip44.encrypt(
        receiverPK, JSON.stringify(rumour));

    const created = randomTimestamp();
    const sealEvent = {
        kind: 13, // seal
        created_at: created,
        tags: [],
        content: encryptedRumour
    }
    if (expiryDays != null) {
        const expiration = created + (expiryDays + 2) * 86400;
        sealEvent.tags.push(["expiration", expiration.toString()]);
    }

    return window.nostr.signEvent(sealEvent);
}

const giftWrap = (event: object, receiverPK: string, expiryDays: number = null) => {
    const secretKey = generateSecretKey();
    const SKString = bytesToHex(secretKey);
    const conversationKey = u.getConversationKey(secretKey, receiverPK);
    const encryptedEvent = encrypt(JSON.stringify(event), conversationKey);
    const created = randomTimestamp();

    const giftWrapEvent = {
        kind: 1059, // gift wrap
        created_at: created,
        tags: [["p", receiverPK]],
        pubkey: getPublicKey(secretKey),
        content: encryptedEvent
    }
    if (expiryDays != null) {
        const expiration = created + (expiryDays + 2) * 86400;
        giftWrapEvent.tags.push(["expiration", expiration.toString()]);
    }

    return finalizeEvent(giftWrapEvent, secretKey);
}

const decryptNIP17MessageNIP07 = async (wrapped: object): object => {
    const sealedText = await window.nostr.nip44.decrypt(
        wrapped.pubkey, wrapped.content);
    const sealed = JSON.parse(sealedText);
    const rumourText = await window.nostr.nip44.decrypt(
        sealed.pubkey, sealed.content);
    return JSON.parse(rumourText);
}

// Decrypts the provided message, addressed to the user.
// If NIP-07 is available, it uses that, otherwise it triggers the signer modal.
export const decrypt = async (wrapped: object, user: object): object => {
    const sk = await ensureSigner(user.pubkey);

    if (sk === null) {
        return decryptNIP17MessageNIP07(wrapped);
    } else {
        return unwrapEvent(wrapped, sk);
    }
}

// Returns the rumours of the messages the provided user has sent or received.
// If the events have an expiration timestamp,
// that timestamp is added to its rumour object as the property `expiration`.
export const getMessageRumours = async (user: object): object[] => {
    const preferredRelays = await getPreferredRelays(user.pubkey);
    // Always include default relays to catch messages that might be there
    const relays = [...new Set([...preferredRelays, ...DM_RELAYS_LIST])];
    const wrapped = await pool.querySync(
        relays, { kinds: [1059], "#p": [user.pubkey], limit: DM_FETCH_LIMIT }
    );

    let rumours = [];
    // intentionally decrypting sequentially to avoid having a bunch of popups
    for (const event of wrapped) {
        if (expired(event)) {
            console.log("relay(s) contain expired event", event.id);
            continue;
        }

        try {
            const rumour = await decrypt(event, user);

            const expires = expiration(event);
            if (expires) {
                rumour.expiration = expires;
            }

            rumours.push(rumour);
        } catch (e) {
            console.error('Failed to decrypt event:', event.id, e);
        }
    }

    return rumours;
}

// Returns the preferred relays of the user with the provided pubkey,
// according to their kind-10050 event.
export const getPreferredRelays = async (pubkey: string): string[] => {
    if (relayListCache.has(pubkey))
        return relayListCache.get(pubkey);

    const events = await pool.querySync(
        DM_RELAYS_LIST, { kinds: [10050], limit: 1, authors: [pubkey] }
    );

    let relays = [];
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
}

// Publish to a single relay with NIP-42 auth support
const publishWithAuth = async (relayUrl: string, event: object, sk: Uint8Array | null): Promise<string> => {
    const relay = await Relay.connect(relayUrl);

    const signAuthEvent = async (authEvent: object) => {
        if (sk) {
            return finalizeEvent(authEvent, sk);
        } else if (window.nostr) {
            return await window.nostr.signEvent(authEvent);
        }
        throw new Error('No signing method for auth');
    };

    try {
        return await relay.publish(event);
    } catch (e) {
        // Check if it's an auth error
        if (e?.message?.includes('auth-required')) {
            // Authenticate and retry
            await relay.auth(signAuthEvent);
            return await relay.publish(event);
        }
        throw e;
    }
};

// Store the current sk for use in publish
let currentSk: Uint8Array | null = null;

const publishToPreferred = async (event: object, pubkey: string, expiryEnabled: boolean): Promise<string> => {
    let preferredRelays = await getPreferredRelays(pubkey);
    if (expiryEnabled) {
        preferredRelays = await relaysSupporting(preferredRelays, [40]);
    }
    if (preferredRelays.length === 0) {
        throw new Error('No relays available to publish to');
    }

    const promises = preferredRelays.map(url => publishWithAuth(url, event, currentSk));
    try {
        return await Promise.any(promises);
    } catch (e) {
        const results = await Promise.allSettled(promises);
        console.error('All relay publishes failed:', results);
        throw e;
    }
}

// Sends a NIP-17 message from `user` to `recipient`.
// If expiryDays is set, messages will expire after that many days.
export const send = async (message: string, user: object, recipient: object, expiryDays?: number) => {
    let event1, event2;
    const sk = await ensureSigner(user.pubkey);

    // Store sk for auth handler
    currentSk = sk;

    if (sk === null) {
        // Use NIP-07 extension
        event1 = await createNIP17MessageNIP07(
            message, user.pubkey, recipient.pubkey, recipient.pubkey, expiryDays);
        event2 = await createNIP17MessageNIP07(
            message, user.pubkey, recipient.pubkey, user.pubkey, expiryDays);
    } else {
        event1 = createNIP17MessageSK(
            message, sk, recipient.pubkey, recipient.pubkey, expiryDays);
        event2 = createNIP17MessageSK(
            message, sk, recipient.pubkey, user.pubkey, expiryDays);
    }

    const p1 = publishToPreferred(event1, recipient.pubkey, expiryDays != null);
    const p2 = publishToPreferred(event2, user.pubkey, expiryDays != null);
    return Promise.all([p1, p2]);
}
