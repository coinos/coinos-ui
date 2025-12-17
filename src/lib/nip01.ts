import { PUBLIC_DM_RELAYS, PUBLIC_COINOS_RELAY } from '$env/static/public';
const DM_RELAYS_LIST = PUBLIC_DM_RELAYS.split(',');
const USERINFO_RELAYS = [ ...DM_RELAYS_LIST, PUBLIC_COINOS_RELAY ];

import { SimplePool } from 'nostr-tools/pool';
const pool = new SimplePool();

export const getNostrUserInfo = async (pubkey: string) => {
    const events = await pool.querySync(
        USERINFO_RELAYS, { kinds: [0], limit: 1, authors: [pubkey] }
    );

    if (events.length == 0) {
        return null;
    }

    return JSON.parse(events[0].content);
}
