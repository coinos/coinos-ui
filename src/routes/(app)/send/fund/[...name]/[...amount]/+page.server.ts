import getRates from "$lib/rates";
import { auth, fd, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ parent, params }) {
  let { name, amount } = params;
  if (!name) name = crypto.randomUUID();
	const { user } = await parent();
	const rates = await getRates();
	const rate = rates[user.currency];
	return { name, amount, rate };
}

export const actions = {
	default: async ({ cookies, request }) => {
		const body = await fd(request);
		let p;

		try {
			p = await post("/payments", body, auth(cookies));
		} catch (e) {
			const { message } = e as Error;
			return fail(400, { message });
		}

		if (p) redirect(307, `/fund/${body.fund}`);
	},
};
