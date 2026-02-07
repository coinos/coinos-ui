import { randomName, randomPassword } from "$lib/random";
import getRates from "$lib/rates";
import { auth, get, login, post, sats } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent }) {
	let { user } = await parent();
	const { id } = params;
	let [amount, currency] = params.amount.split("/");

	if (!currency) currency = user?.currency;
	if (currency) currency = currency.toUpperCase();
	const rates = await getRates();
	const rate = rates[currency || "USD"];
	if (currency && !rate) error(500, "Invalid currency symbol");

	if (!amount) {
		const balance = await get(`/fund/${id}`);
		amount = balance.authorization || balance.amount;
	} else if (currency) {
		amount = Math.round((amount * sats) / rate);
	}

	if (!amount) redirect(307, `/fund/${id}`);

	if (user) {
		try {
			({ amount } = await post("/take", { amount, id }, auth(cookies)));
		} catch (e) {
			redirect(307, `/fund/${id}`);
		}

		return { amount, currency, id, rate, rates, password: null };
	}

	return { amount, currency, id, rate, rates, needsCaptcha: true };
}

export const actions = {
	default: async ({ cookies, request, params }) => {
		const { id } = params;
		const form = await request.formData();
		const recaptcha = form.get("recaptcha") as string;
		const amount = Number(form.get("amount"));
		const ip = request.headers.get("cf-connecting-ip");
		const host = request.headers.get("host");

		const username = randomName() + Math.floor(Math.random() * 99) + 1;
		const password = randomPassword();

		const user = { username, password, fresh: true, recaptcha };

		const { sk } = await post(
			"/register",
			{ user },
			{ "cf-connecting-ip": ip },
		);

		await login(user, cookies, ip, host);

		const expires = new Date();
		expires.setSeconds(expires.getSeconds() + 21000000);
		cookies.set("sk", sk, {
			path: "/",
			expires,
			httpOnly: false,
			sameSite: "lax",
		});

		let swept;
		try {
			swept = await post("/take", { amount, id }, auth(cookies));
		} catch (e) {
			redirect(307, `/fund/${id}`);
		}

		return { amount: swept.amount, password, username };
	},
};
