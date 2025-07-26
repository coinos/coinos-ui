import { randomName, randomPassword } from "$lib/random";
import getRates from "$lib/rates";
import { auth, get, post, register, sats } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";

export async function load({ cookies, request, params, parent }) {
	let { user } = await parent();
	const { id } = params;
	let [amount, currency] = params.amount.split("/");

	if (!currency) currency = user?.currency;
	const rates = await getRates();
	const rate = rates[currency?.toUpperCase() || "USD"];
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

		let redirectUrl = `/fund/${id}/sweep`;
		if (amount) redirectUrl += `/${amount}`;
		if (currency) redirectUrl += `/${currency}`;

		await register(user, ip, cookies, redirectUrl);
	}

	let r;
	try {
		r = await post("/take", { amount, id }, auth(cookies));
	} catch (e) {
		redirect(307, `/fund/${id}`);
	}

	if (r) redirect(307, `/${user.username}`);
	return { amount, currency, id, rate, rates, password };
}
