import { auth, get } from "$lib/utils";

export async function load({ cookies }) {
	const invoices = await get("/invoices", auth(cookies));
	return { invoices };
}
