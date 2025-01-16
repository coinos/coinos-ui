import { get } from "$lib/utils";

export async function load({ params }) {
	const event = await get(`/event/${params.id}`);
	const author = await get(`/users/${event.pubkey}`);
	const zaps = await get(`/zaps/${params.id}`);
	return { author, event, zaps };
}
