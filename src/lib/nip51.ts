import { SimplePool } from 'nostr-tools/pool';
import { verifyEvent } from 'nostr-tools/pure';
import { signEvent } from '$lib/nip07';
const pool = new SimplePool();

import { PUBLIC_DM_RELAYS } from '$env/static/public';
const DM_RELAYS_LIST = PUBLIC_DM_RELAYS.split(',');

export const mute = async (user: object, pubkey: string, hide: bool) => {
    let { shown, hidden } = await getMuteLists(user);
    if (hide) {
        hidden.push(pubkey);
    } else {
        shown.push(pubkey);
    }
    await publishMuteList(user, shown, hidden);
}

export const unmute = async (user: object, pubkey: string) => {
    let { shown, hidden } = await getMuteLists(user);
    shown = shown.filter(p => p !== pubkey);
    hidden = hidden.filter(p => p !== pubkey);
    await publishMuteList(user, shown, hidden);
}

export const mutedAccounts = async (user: object): Set<string> => {
    const { shown, hidden } = await getMuteLists(user);
    let muted = new Set<string>();
    for (const pubkey of shown) {
        muted.add(pubkey);
    }
    for (const pubkey of hidden) {
        muted.add(pubkey);
    }
    return muted;
}

const getMuteLists = async (user: object): object => {
    const listEvents = await pool.querySync(
        DM_RELAYS_LIST, { kinds: [10000], "authors": [user.pubkey], limit: 1 }
    );
    if (listEvents.length == 0) {
        return { shown: [], hidden: [] };
    }

    let shown = [];
    for (const tag of listEvents[0].tags) {
        if (tag.length >= 2 && tag[0] == "p") {
            shown.push(tag[1]);
        }
    }

    return { shown, hidden: [] };
}

const publishMuteList = async (user: object, shown: Array<string>, hidden: Array<string>) => {
    const event = await signEvent({
        kind: 10000,
        created_at: Math.floor(Date.now() / 1000),
        tags: shown.map(p => ["p", p]),
        content: ''
    }, user);
    return Promise.any(pool.publish(DM_RELAYS_LIST, event));
}
