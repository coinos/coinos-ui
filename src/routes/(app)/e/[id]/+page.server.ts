import { get, post } from "$lib/utils";
import { error } from "@sveltejs/kit";

export async function load({ params }) {
	try {
		const event = await get(`/event/${params.id}/full`);
		return { event };
	} catch (e) {
		console.log(e);
		error(500, { message: "Failed to get event" });
	}
}
