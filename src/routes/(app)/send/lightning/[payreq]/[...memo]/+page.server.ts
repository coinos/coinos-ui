import getRates from "$lib/rates";
import { auth, fd, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent }) {
	const { user } = await parent();
	let data: any = { ...params };
	const rates = await getRates();
	if (!params.payreq.startsWith("lno")) {
		data = { ...data, ...(await post("/parse", params, auth(cookies))) };
	}

	data.rate = rates[user.currency];

	const aid = cookies.get("aid") || user.id;
	if (aid !== user.id) {
		const account = await get(`/account/${aid}`, auth(cookies));
		if (account.type === "ark") {
			data.account = account;
			data.serverArkAddress = await get("/ark/address");
		} else if (account.type === "bitcoin") {
			data.account = account;
		}
	}

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
			body.aid = cookies.get("aid");

			console.log("BODY", body);

			p = await post("/payments", body, auth(cookies));
		} catch (e) {
			const { message } = e as Error;
			return fail(400, { message });
		}

		redirect(307, `/sent/${p.id}`);
	},
};
