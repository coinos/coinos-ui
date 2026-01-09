import { bytesToHex } from '@noble/hashes/utils';
import { finalizeEvent } from 'nostr-tools/pure';
import { unwrapEvent } from 'nostr-tools/nip17';
import { getPrivateKey } from '$lib/nostr';
import * as libnip44 from '$lib/nip44';
import { u } from '$lib/nip44';

export const signEvent = async (event: object, user: object): object => {
    if (await window.nostr.getPublicKey() === user.pubkey) {
        return window.nostr.signEvent(event);
    } else {
        const sk = await getPrivateKey();
        return finalizeEvent(event, sk);
    }
}

// Encrypts an event in NIP-44 using NIP-07 if available, otherwise getPrivateKey()
export const encrypt = async (json: object, user: object, receiverPK: string): string => {
    if (await window.nostr.getPublicKey() === user.pubkey) {
        return window.nostr.nip44.encrypt(
            receiverPK, JSON.stringify(json));
    } else {
        const senderSK = await getPrivateKey();
        const senderSKString = bytesToHex(senderSK);
        const ckey = u.getConversationKey(senderSKString, receiverPK);
        return libnip44.encrypt(JSON.stringify(json), ckey);
    }
}

// Decrypts an event in NIP-44 using NIP-07 if available, otherwise getPrivateKey()
export const decrypt = async (encrypted: string, user: object, receiverPK: string): object => {
    if (await window.nostr.getPublicKey() === user.pubkey) {
        return JSON.parse(await window.nostr.nip44.decrypt(
            receiverPK, encrypted));
    } else {
        const senderSK = await getPrivateKey();
        const senderSKString = bytesToHex(senderSK);
        const ckey = u.getConversationKey(senderSKString, receiverPK);
        return JSON.parse(libnip44.decrypt(encrypted, ckey));
    }
}
