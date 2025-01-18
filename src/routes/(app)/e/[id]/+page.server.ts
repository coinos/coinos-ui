import { get, post } from "$lib/utils";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
	try {
		const event = await get(`/event/${params.id}`);
		const { parts, names } = await post("/parseEvent", { event });
		const author = await get(`/users/${event.pubkey}`);
		const zaps = await get(`/zaps/${params.id}`);

		return { author, event, names, parts, zaps };
	} catch (e) {
		console.log(e);
		error(500, { message: "Failed to get event" });
	}
}
