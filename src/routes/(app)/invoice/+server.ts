import { auth, post } from "$lib/utils";
import { error, json } from "@sveltejs/kit";

export const POST = async ({ cookies, request }) => {
	try {
		const body = await request.json();
		return json(await post("/invoice", body, auth(cookies)));
	} catch (e) {
		const { message } = e as Error;
		error(500, message);
	}
};
