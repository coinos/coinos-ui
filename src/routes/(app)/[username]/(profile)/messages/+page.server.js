import { get } from '$lib/utils';

export async function load({ params, parent, url }) {
	let { user, subject } = await parent();
	let { since = 0 } = params;

	let messages = [];

	try {
		messages = await get(`/nostr/${user.pubkey}/${subject.pubkey}/${since}/messages`);
	} catch (e) {
		console.log(`failed to fetch nostr messages`, e);
	}

	return { newMessages: messages };
}
