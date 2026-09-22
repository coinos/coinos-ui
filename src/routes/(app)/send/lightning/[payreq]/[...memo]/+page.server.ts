import getRates from "$lib/rates";
import { auth, fd, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

// Ask the server what this send will actually cost: the routing fee askrene
// quotes for the invoice (the same answer xpay gets when it pays) plus the
// platform fee. The quoted routing fee becomes the payment's maxfee, so what
// the user sees is what gets debited. A failed quote isn't fatal — the page
// falls back to the old manual max-fee reserve.
const quote = async (body, cookies) => {
	try {
		const q = await post("/lightning/quote", body, auth(cookies));
		return { ...q, quoteError: undefined };
	} catch (e) {
		const { message } = e as Error;
		return { fee: undefined, ourfee: undefined, quoteError: message };
	}
};

export async function load({ cookies, params, parent }) {
	const { user } = await parent();
	let data = { ...params };
	const rates = await getRates();
	data = { ...data, ...(await post("/parse", params, auth(cookies))) };

	// Lightning sends always draw on the main account
	const { balance } = await get(`/account/${user.id}`, auth(cookies));
	data.balance = balance;

	if (data.amount)
		data = { ...data, ...(await quote({ payreq: params.payreq, amount: data.amount }, cookies)) };

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

		data = { ...data, ...(await quote({ payreq: data.payreq || payreq, amount }, cookies)) };

		return data;
	},

	// Send everything: the server solves for the largest amount whose amount +
	// routing fee + platform fee lands exactly on the balance. For an offer it
	// also fetches the invoice for that exact amount.
	max: async ({ cookies, params }) => {
		const { payreq } = params;
		try {
			const q = await post("/lightning/quote", { payreq, max: true }, auth(cookies));
			let data = { amount: q.amount, fee: q.fee, ourfee: q.ourfee, total: q.total, max: true };
			if (q.payreq) {
				data = { ...data, ...(await post("/parse", { payreq: q.payreq }, auth(cookies))) };
				data.payreq = q.payreq;
			}
			return data;
		} catch (e) {
			const { message } = e as Error;
			return fail(400, { message });
		}
	},

	send: async ({ cookies, request }) => {
		let p;
		try {
			const body = await fd(request);

			p = await post("/payments", body, auth(cookies));
		} catch (e) {
			const { message } = e as Error;
			return fail(400, { message });
		}

		redirect(307, `/sent/${p.id}`);
	},
};
