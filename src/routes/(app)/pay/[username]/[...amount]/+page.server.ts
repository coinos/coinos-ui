import { auth, fd, get, post, sats, types } from "$lib/utils";
import { error, fail, redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent }) {
	const { username } = params;
	const { rates, user } = await parent();

	if (user?.username === username) redirect(307, `/${username}/receive`);
	const subject = await get(`/users/${username}`);

	let [amount, currency] = params.amount.split("/");

	const rate = rates[currency ? currency.toUpperCase() : subject.currency];
	if (!rate) error(500, "Invalid currency symbol");

	if (amount) {
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
		let id;
		try {
			const body = await fd(request);
			const { amount, rate, prompt, type, username } = body;

			({ id } = await post(
				"/invoice",
				{
					invoice: {
						amount,
						rate,
						prompt,
						type,
					},
					user: { username },
				},
				auth(cookies),
			));
		} catch (e) {
			console.log(e);
			const { message } = e as Error;
			return fail(400, { message });
		}

		redirect(307, `/invoice/${id}`);
	},
};
