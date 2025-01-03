import { auth, post } from "$lib/utils";
import { error, json } from "@sveltejs/kit";

export async function GET({ url }) {
	console.log(url.searchParams.get("event"));
	console.log(url.searchParams.get("uid"));
	return json({});
}

export async function POST({ cookies, request }) {
	const body = await request.json();
	try {
		const result = await post("/event", body, auth(cookies));
		return json(result);
	} catch (e: any) {
		error(500, e.message);
	}
}
