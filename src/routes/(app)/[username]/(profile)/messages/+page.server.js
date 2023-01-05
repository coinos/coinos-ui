import { get } from '$lib/utils';

export async function load({ params, parent, url }) {
	let { user, subject } = await parent();

	let messages = [];

	try {
		messages = await get(`/nostr/${user.pubkey}/${subject.pubkey}/messages`);
		console.log('MESSAGES', messages);
	} catch (e) {
		console.log(`failed to fetch nostr messages`, e);
	}

	return { messages };
}
