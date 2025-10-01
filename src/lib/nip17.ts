import { bytesToHex } from '@noble/hashes/utils';
import { finalizeEvent, getEventHash, generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { encrypt, u } from '$lib/nip44';

const TWO_DAYS = 2 * 24 * 60 * 60;
const randomTimestamp = () => Math.floor(
    Date.now() / 1000 - Math.random() * TWO_DAYS);

// Create a NIP-17 message using a provided sender secret key.
export const createNIP17MessageSK = (text: string, senderSK: Uint8Array, receiverPK: string) => {
    const rumour = createRumour(text, getPublicKey(senderSK), receiverPK);
    const sealed = sealRumourSK(rumour, senderSK, receiverPK);
    return giftWrap(sealed, receiverPK);
}

// Create a NIP-17 message using NIP-07, requiring no sender secret key.
export const createNIP17MessageNIP07 = async (text: string, senderPK: string, receiverPK: string) => {
    const rumour = createRumour(text, senderPK, receiverPK);
    const sealed = await sealRumourNip07(rumour, receiverPK);
    return giftWrap(sealed, receiverPK);
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

const sealRumourSK = (rumour: object, senderSK: Uint8Array, receiverPK: string) => {
    const senderSKString = bytesToHex(senderSK);
    const conversationKey = u.getConversationKey(senderSKString, receiverPK);
    const encryptedRumour = encrypt(JSON.stringify(rumour), conversationKey);

    const sealEvent = {
        kind: 13, // seal
        created_at: randomTimestamp(),
        tags: [],
        pubkey: getPublicKey(senderSK),
        content: encryptedRumour
    }

    return finalizeEvent(sealEvent, senderSK);
}

const sealRumourNip07 = async (rumour: object, receiverPK: string) => {
    const encryptedRumour = await window.nostr.nip44.encrypt(
        receiverPK, JSON.stringify(rumour));

    const sealEvent = {
        kind: 13, // seal
        created_at: randomTimestamp(),
        tags: [],
        content: encryptedRumour
    }

    return window.nostr.signEvent(sealEvent);
}

const giftWrap = (event: object, receiverPK: string) => {
    const secretKey = generateSecretKey();
    const SKString = bytesToHex(secretKey);
    const conversationKey = u.getConversationKey(secretKey, receiverPK);
    const encryptedEvent = encrypt(JSON.stringify(event), conversationKey);

    const giftWrapEvent = {
        kind: 1059, // gift wrap
        created_at: randomTimestamp(),
        tags: [["p", receiverPK]],
        pubkey: getPublicKey(secretKey),
        content: encryptedEvent
    }

    return finalizeEvent(giftWrapEvent, secretKey);
}

export const decryptNIP17MessageNIP07 = async (wrapped: object): object => {
    const sealedText = await window.nostr.nip44.decrypt(
        wrapped.pubkey, wrapped.content);
    const sealed = JSON.parse(sealedText);
    const rumourText = await window.nostr.nip44.decrypt(
        sealed.pubkey, sealed.content);
    return JSON.parse(rumourText);
}
