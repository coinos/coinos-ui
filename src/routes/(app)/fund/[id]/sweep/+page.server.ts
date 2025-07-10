import { randomName, randomPassword } from "$lib/random";
import getRates from "$lib/rates";
import { auth, get, post, register } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, request, params, parent }) {
	let { user } = await parent();
	const { id } = params;
	const { amount } = await get(`/fund/${id}`);
	const rates = await getRates();
	const rate = rates[user?.currency || "USD"];

	const username = randomName();
	const password = randomPassword();

	if (!amount) redirect(307, `/fund/${id}`);
	if (!user) {
		const ip = request.headers.get("cf-connecting-ip");

		user = {
			username,
			password,
			fresh: true,
		};

		await register(user, ip, cookies, `/fund/${id}/sweep`);
	}

	await post("/take", { amount, id }, auth(cookies));
	return { amount, id, rate, rates, password };
}
