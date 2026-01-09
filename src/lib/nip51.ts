import { SimplePool } from 'nostr-tools/pool';
const pool = new SimplePool();

import { PUBLIC_DM_RELAYS } from '$env/static/public';
const DM_RELAYS_LIST = PUBLIC_DM_RELAYS.split(',');

// export const mute = async (pubkey: string, hidden: bool) => {
    
// }

// export const unmute = async (pubkey: string) => {
    
// }

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

// const publishMuteList = async (shown: Array<string>, hidden: Array<string>) => {
    
// }
