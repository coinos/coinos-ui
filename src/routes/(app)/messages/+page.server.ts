import { get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

interface Message {
	created_at: number;
}

interface Note {
	created_at: number;
	seen: number;
}

export async function load({ params, parent }) {
	const { user } = await parent();
	if (user.username !== params.username) redirect(307, `/${params.username}`);
	const { since = 0 } = params;

	let messages = [];
	let notes = [];

	if (user?.pubkey) {
		const { pubkey } = user;
		try {
			messages = await get(`/${pubkey}/${since}/messages`);
			messages = messages.sort(
				(a: Message, b: Message) => b.created_at - a.created_at,
			);
		} catch (e) {
			console.log("failed to fetch nostr messages", e);
		}

		try {
			notes = await get(`/${pubkey}/notes`);
		} catch (e) {
			console.log(`failed to fetch nostr notes for ${pubkey}`, e);
		}

		notes.map((e: Note) => {
			e.seen = e.created_at;
		});
	}

	return { messages, notes };
}
