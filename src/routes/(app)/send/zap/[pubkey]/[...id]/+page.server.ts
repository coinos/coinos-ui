import getRates from "$lib/rates";
import { auth, fd, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ params, parent }) {
	const { user } = await parent();
	const data = { ...params };
	const rates = await getRates();

	data.rate = rates[user.currency];
	return data;
}

export const actions = {
	setAmount: async ({ cookies, params, request }) => {
		const data = await fd(request);
		const { id, pubkey } = params;
		const { amount } = data;

		data.request = await post(
			"/zapRequest",
			{ id, amount, pubkey },
			auth(cookies),
		);

		return data;
	},

	send: async ({ cookies, request }) => {
		let p;
		try {
			const body = await fd(request);

			p = await post("/payments", body, auth(cookies));
		} catch (_) {
			return fail(400, { message: "payments.failedToRoute" });
		}

		redirect(307, `/sent/${p.id}`);
	},
};
