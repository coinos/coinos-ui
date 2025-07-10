import invoice from "$lib/invoice";
import getRates from "$lib/rates";
import { auth, get, post } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, parent }) {
	const rates = await getRates();
	let { invoice, subject, user } = await parent();
	if (!invoice.amount) redirect(307, `/invoice/${invoice.id}`);

	if (user) {
		const trust = await get("/trust", auth(cookies));
		const trusted = trust.includes(invoice.uid);
		if (trusted) {
			if (invoice.prompt && invoice.tip === null && user.tip > 0) {
				invoice.tip = Math.round(invoice.amount * (user.tip / 100));
				invoice = await post(
					"/invoice",
					{ invoice, user: subject },
					auth(cookies),
				);
			}

			const p = await post("/payments", invoice, auth(cookies));
			redirect(307, `/sent/${p.id}`);
		}
	}

	const rate = rates[subject?.currency];
	const invoiceRate = rates[invoice.currency];
	return { rate, invoiceRate };
}

export const actions = {
	default: invoice,
};
