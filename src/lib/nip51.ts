import { SimplePool } from 'nostr-tools/pool';
import { verifyEvent } from 'nostr-tools/pure';
import { signEvent, encrypt, decrypt } from '$lib/nip07';
const pool = new SimplePool();

import { PUBLIC_DM_RELAYS } from '$env/static/public';
const DM_RELAYS_LIST = PUBLIC_DM_RELAYS.split(',');

export const mute = async (user: object, pubkey: string, hide: bool) => {
    let { shown, hidden } = await getMuteLists(user);
    if (hide) {
        hidden.push(["p", pubkey]);
    } else {
        shown.push(["p", pubkey]);
    }
    await publishMuteList(user, shown, hidden);
}

const tagMatches = (tag: string[], pubkey: string): bool =>
    tag.length >= 2 && tag[0] === "p" && tag[1] === pubkey;

export const unmute = async (user: object, pubkey: string) => {
    let { shown, hidden } = await getMuteLists(user);
    shown = shown.filter(tag => !tagMatches(tag, pubkey));
    hidden = hidden.filter(tag => !tagMatches(tag, pubkey));
    await publishMuteList(user, shown, hidden);
}

export const mutedAccounts = async (user: object): Set<string> => {
    const { shown, hidden } = await getMuteLists(user);
    let muted = new Set<string>();
    for (const tag of shown) {
        if (tag.length >= 2 && tag[0] === "p") {
            muted.add(tag[1]);
        }
    }
    for (const tag of hidden) {
        if (tag.length >= 2 && tag[0] === "p") {
            muted.add(tag[1]);
        }
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

    return {
        shown: listEvents[0].tags,
        hidden: listEvents[0].content == "" ? [] :
            await decrypt(listEvents[0].content, user, user.pubkey)
    };
}

const publishMuteList = async (user: object, shown: string[], hidden: string[]) => {
    const event = await signEvent({
        kind: 10000,
        created_at: Math.floor(Date.now() / 1000),
        tags: shown,
        content: await encrypt(hidden, user, user.pubkey)
    }, user);
    return Promise.any(pool.publish(DM_RELAYS_LIST, event));
}
