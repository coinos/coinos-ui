import { auth, get, isInvalidTokenError } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies }) {
	const token = cookies.get("token");

	let user;
	if (token) {
		try {
			user = await get("/me", auth(cookies));
		} catch (e) {
			if (isInvalidTokenError(e)) {
				redirect(307, "/logout");
			}
		}
	}

	return { user };
}
