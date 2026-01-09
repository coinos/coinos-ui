import { finalizeEvent } from 'nostr-tools/pure';
import { getPrivateKey } from '$lib/nostr';

export const signEvent = async (event: object, user: object): object => {
    if (await window.nostr.getPublicKey() === user.pubkey) {
        return window.nostr.signEvent(event);
    } else {
        const sk = await getPrivateKey();
        return finalizeEvent(event, sk);
    }
}
