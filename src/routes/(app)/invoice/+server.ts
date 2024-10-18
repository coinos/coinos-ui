import { auth, post } from "$lib/utils";
import { json } from "@sveltejs/kit";

export const POST = async ({ cookies: c, request: r }) => {
	const j = await r.json();
	return json(await post("/invoice", j, auth(c)));
};
