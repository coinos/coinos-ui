import { bytesToHex } from '@noble/hashes/utils';
import { finalizeEvent, getEventHash, generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { encrypt, u } from '$lib/nip44';

const TWO_DAYS = 2 * 24 * 60 * 60;
const randomTimestamp = () => Math.floor(
    Date.now() / 1000 - Math.random() * TWO_DAYS);

export const createNIP17Message = (text: string, senderSK: Uint8Array, receiverPK: string) => {
    const rumour = createRumour(text, senderSK, receiverPK);
    const sealed = sealRumour(rumour, senderSK, receiverPK);
    const wrapped = giftWrap(sealed, receiverPK);
    return wrapped;
}

const createRumour = (text: string, senderSK: Uint8Array, receiverPK: string) => {
    const rumour = {
        kind: 14, // rumour
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", receiverPK]],
        pubkey: getPublicKey(senderSK),
        content: text
    };
    rumour.id = getEventHash(rumour);
    return rumour;
}

const sealRumour = (rumour: object, senderSK: Uint8Array, receiverPK: string) => {
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
