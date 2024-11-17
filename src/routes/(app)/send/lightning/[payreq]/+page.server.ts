import { auth, fd, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ cookies, params }) {
	if (params.payreq.startsWith("lno")) return params;
	const data = await post("/parse", params, auth(cookies));
	data.payreq = params.payreq;
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
		} catch (e: any) {
			if (
				e.message.includes("unusable") ||
				e.message.includes("routes") ||
				e.message.includes("minflow")
			)
				e.message = "payments.failedToRoute";
			return fail(400, { message: e.message });
		}

		redirect(307, `/sent/${p.id}`);
	},
};
