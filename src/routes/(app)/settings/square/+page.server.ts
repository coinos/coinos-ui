import { auth, get } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ cookies, url }) {
	let connected;

	const query = url.searchParams.toString();

	try {
		await get(`/square/auth?${query}`, auth(cookies));
		connected = true;
	} catch (e) {
		const { message } = e as Error;
		fail(400, { message });
	}

	if (connected) redirect(307, "/settings/account");
}
