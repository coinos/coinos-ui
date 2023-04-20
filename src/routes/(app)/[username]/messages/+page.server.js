import { get } from '$lib/utils';

export async function load({ params, parent, url }) {
	let { user, subject } = await parent();
	let { since = 0 } = params;

	let messages = [];

	try {
		messages = await get(`/${user.pubkey}/${since}/messages`);

		messages = messages
			.filter((m) => m.recipient?.id === subject.id || m.author?.id === subject.id)
			.sort((a, b) => a.created_at - b.created_at);

		if (user.id === subject.id) messages = messages.filter((m) => m.recipient.id === m.author.id);
	} catch (e) {
		console.log(`failed to fetch nostr messages`, e);
	}

	return { messages, user };
}
