import { get, auth } from "$lib/utils";

export async function load({ cookies }) {
	const token = cookies.get("token");

	let user;
	if (token) {
		try {
			user = await get("/me", auth(cookies));
		} catch (e) {}
	}

	return { user };
}
