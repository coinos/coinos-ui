import { auth, post } from "$lib/utils";
import { json } from "@sveltejs/kit";

export const POST = async ({ cookies, request }) => {
	const body = await request.json();
	return json(await post("/invoice", body, auth(cookies)));
};
