import { get, post } from "$lib/utils";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
	try {
		const event = await get(`/event/${params.id}`);
		const { parts, names } = await post("/parseEvent", { event });
		event.parts = parts;
		event.names = names;
		event.author = await get(`/users/${event.pubkey}`);
		event.zaps = await get(`/zaps/${params.id}`);

		return { event };
	} catch (e) {
		console.log(e);
		error(500, { message: "Failed to get event" });
	}
}
