import { auth, get } from "$lib/utils";

export async function load({ cookies }) {
	const aid = cookies.get("aid");
	const { balance } = await get(`/account/${aid}`, auth(cookies));
	return { balance };
}
