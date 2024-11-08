import { auth, get } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, params, url }) {
	const tab = url.pathname.split("/").filter(Boolean).pop();
	if (tab === "settings") redirect(307, `${url.pathname}/account`);
	params.cookies = cookies.getAll();
	const subscriptions = await get("/subscriptions", auth(cookies));
	return { cookies: cookies.getAll(), subscriptions, tab };
}
