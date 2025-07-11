import getRates from "$lib/rates";
import { auth, fd, get, post, types } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";

export async function load({ cookies, depends, params: { id }, parent }) {
	depends("app:trust");
	const { user } = await parent();
	const aid = cookies.get("aid") || user.id;

	const invoice = await get(`/invoice/${id}`);

	const trust = await get("/trust", auth(cookies));
	const trusted = trust.includes(invoice.uid);
	if (trusted) {
		let p;
		try {
			p = await post("/payments", invoice, auth(cookies));
		} catch (e) {
			const { message } = e as Error;
			console.log("payment failed", id, e);
			error(500, message);
		}
		if (p) redirect(307, `/sent/${p.id}`);
	}

	if (invoice.amount && invoice.prompt && invoice.tip === null)
		redirect(307, `/invoice/${id}/tip`);

	if (invoice.memoPrompt && invoice.memo === null)
		redirect(307, `/invoice/${id}/memo`);

	if (user && invoice.aid === aid)
		error(500, { message: "Cannot send to self" });
	else if (user && ![types.lightning, types.bolt12].includes(invoice.type))
		redirect(
			307,
			`/send/${invoice.type === types.ecash ? "ecash" : "bitcoin"}/${
				invoice.hash
			}`,
		);

	if (!user) redirect(307, `/invoice/${id}`);

	const rates = await getRates();
	const rate = rates[user.currency];
	const invoiceRate = rates[invoice.currency];

	const { balance } = await get(`/account/${aid}`, auth(cookies));
	return { balance, invoice, user, rate, invoiceRate, trusted };
}

export const actions = {
	default: async ({ cookies, params: { id }, request }) => {
		let p;
		try {
			const body = await fd(request);
			body.hash = id;

			p = await post("/payments", body, auth(cookies));
		} catch (e) {
			const { message } = e as Error;
			console.log("payment failed", id, e);
			error(500, message);
		}

		redirect(307, `/sent/${p.id}`);
	},
};
