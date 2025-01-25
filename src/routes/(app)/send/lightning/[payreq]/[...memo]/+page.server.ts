import getRates from "$lib/rates";
import { auth, fd, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent }) {
	const { user } = await parent();
	let data = { ...params };
	const rates = await getRates();
	if (!params.payreq.startsWith("lno")) {
		data = { ...data, ...(await post("/parse", params, auth(cookies))) };
	}

	data.rate = rates[user.currency];
	return data;
}

export const actions = {
	setAmount: async ({ cookies, params, request }) => {
		let data = await fd(request);
		const { payreq } = params;
		const { amount } = data;
		if (payreq.startsWith("lno")) {
			const { invoice } = await post("/fetchinvoice", {
				amount,
				offer: payreq,
			});

			data = await post("/parse", { payreq: invoice }, auth(cookies));
			data.payreq = invoice;
		}

		return data;
	},

	send: async ({ cookies, request }) => {
		let p;
		try {
			const body = await fd(request);

			p = await post("/payments", body, auth(cookies));
		} catch (e) {
			let { message } = e as Error;
			if (!message.includes("Insufficient")) message = "payments.failedToRoute";
			return fail(400, { message });
		}

		redirect(307, `/sent/${p.id}`);
	},
};
