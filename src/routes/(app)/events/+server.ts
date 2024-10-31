import { auth, post } from "$lib/utils";
import { json, error } from "@sveltejs/kit";

export async function POST({ cookies, request }) {
	const body = await request.json();
	try {
		const result = await post("/event", body, auth(cookies));
		return json(result);
	} catch (e: any) {
		error(500, e.message);
	}
}
