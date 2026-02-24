import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { finalizeEvent } from 'nostr-tools/pure';
import * as libnip44 from '$lib/nip44';
import { u } from '$lib/nip44';

import { eventToSign, signer } from '$lib/store';
import { get } from 'svelte/store';

// Ensures we have access to a secret key, triggering the signer modal if needed.
// Returns the sk as Uint8Array, or null if using NIP-07 extension.
export const ensureSigner = async (userPubkey: string): Promise<Uint8Array | null> => {
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

// Signs an event using NIP-07 if available, otherwise getPrivateKey()
export const signEvent = async (event: any, user: any): Promise<any> => {
    const sk = await ensureSigner(user.pubkey);
    if (sk === null) {
        return (window as any).nostr.signEvent(event);
    } else {
        return finalizeEvent(event, sk);
    }
}

// Encrypts an event in NIP-44 using NIP-07 if available, otherwise getPrivateKey()
export const encrypt = async (json: any, user: any, receiverPK: string): Promise<string> => {
    const senderSK = await ensureSigner(user.pubkey);
    if (senderSK === null) {
        return (window as any).nostr.nip44.encrypt(
            receiverPK, JSON.stringify(json));
    } else {
        const senderSKString = bytesToHex(senderSK);
        const ckey = u.getConversationKey(senderSKString, receiverPK);
        return libnip44.encrypt(JSON.stringify(json), ckey);
    }
}

// Decrypts an event in NIP-44 using NIP-07 if available, otherwise getPrivateKey()
export const decrypt = async (encrypted: string, user: any, receiverPK: string): Promise<any> => {
    const senderSK = await ensureSigner(user.pubkey);
    if (senderSK === null) {
        return JSON.parse(await (window as any).nostr.nip44.decrypt(
            receiverPK, encrypted));
    } else {
        const senderSKString = bytesToHex(senderSK);
        const ckey = u.getConversationKey(senderSKString, receiverPK);
        return JSON.parse(libnip44.decrypt(encrypted, ckey));
    }
}
