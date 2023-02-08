import { auth, get } from '$lib/utils';

export async function load({ cookies, params, parent, url }) {
	let { subject } = await parent();
	let { pubkey } = subject;

	let events = [];

	try {
		events = await get(`/${pubkey}/notes`);
	} catch (e) {
		console.log(`failed to fetch nostr events for ${pubkey}`, e);
	}

	events.map((e) => {
		e.seen = e.created_at;
	});

  let { requests } = await get('/requests', auth(cookies));

	return { events, requests };
}
