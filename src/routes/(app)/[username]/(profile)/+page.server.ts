import { auth, get } from "$lib/utils";

export async function load({ cookies, depends, parent }) {
	depends("app:payments");
	depends("app:items");

	const { subject } = await parent();

	let accounts = [];
	if (cookies.get("token")) accounts = await get("/accounts", auth(cookies));

	const items = await get(`/${subject.id}/items`, auth(cookies));
	items.map((i) => (i.quantity = 0));

	return { accounts, items };
}
