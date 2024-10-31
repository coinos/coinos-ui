import { auth, get } from "$lib/utils";

export async function load({ cookies, depends, params }) {
	depends("app:payments");
	const payment = await get(`/payments/${params.id}`, auth(cookies));
	return { payment };
}
