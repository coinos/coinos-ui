import { auth, get } from '$lib/utils';

export async function load({ cookies, params, parent, url }) {
	let { user, subject } = await parent();
	let { pubkey } = subject;
	let { since = 0 } = params;

	let messages, invoices, sent, received;
	messages = invoices = sent = received = [];

	if (user) {
		try {
			messages = await get(`/${user.pubkey}/${since}/messages`);
			messages = messages.sort((a, b) => b.created_at - a.created_at);
		} catch (e) {
			console.log(`failed to fetch nostr messages`, e);
		}

		({ invoices, sent, received } = await get('/requests', auth(cookies)));
	}

	let notes = [];

	try {
		notes = await get(`/${pubkey}/notes`);
	} catch (e) {
		console.log(`failed to fetch nostr notes for ${pubkey}`, e);
	}

	notes.map((e) => {
		e.seen = e.created_at;
	});

	return { invoices, messages, notes, sent, received };
}
