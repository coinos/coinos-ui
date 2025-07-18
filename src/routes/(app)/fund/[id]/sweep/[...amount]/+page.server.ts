import { randomName, randomPassword } from "$lib/random";
import getRates from "$lib/rates";
import { auth, get, post, register, sats } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";

export async function load({ cookies, request, params, parent }) {
	let { user } = await parent();
	const { id } = params;
	let [amount, currency] = params.amount.split("/");

	const rates = await getRates();
	const rate = rates[user?.currency || "USD"];
	if (currency && !rate) error(500, "Invalid currency symbol");

	if (!amount) {
		const balance = await get(`/fund/${id}`);
		amount = balance.amount;
	} else if (currency) {
		amount = (amount * sats) / rate;
	}

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
