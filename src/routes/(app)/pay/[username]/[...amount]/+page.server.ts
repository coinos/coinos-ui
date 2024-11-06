import { auth, fd, get, post, sats, types } from "$lib/utils";
import { error, fail, redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent }) {
	const { username } = params;
	const { rates, user } = await parent();

	if (user?.username === username) redirect(307, `/${username}/receive`);
	const subject = await get(`/users/${username}`);

	let [amount, currency] = params.amount.split("/");

	let rate;

	if (amount) {
		rate = rates[currency ? currency.toUpperCase() : subject.currency];
		if (!rate) error(500, "Invalid currency symbol");
		if (currency) amount = (amount * sats) / rate;

		const { id } = await post(
			"/invoice",
			{
				invoice: {
					amount,
					currency: currency === subject.currency ? currency : undefined,
					prompt: false,
					rate: currency === subject.currency ? rate : undefined,
					type: types.lightning,
				},
				user: { username },
			},
			auth(cookies),
		);

		redirect(307, `/invoice/${id}`);
	}

	return { amount, rate, subject };
}

export const actions = {
	default: async ({ cookies, request }) => {
		let p;
		try {
			const body = await fd(request);
			p = await post("/payments", body, auth(cookies));
		} catch (e: any) {
			console.log(e);
			return fail(400, { message: e.message });
		}

		redirect(307, `/sent/${p.id}`);
	},
};
