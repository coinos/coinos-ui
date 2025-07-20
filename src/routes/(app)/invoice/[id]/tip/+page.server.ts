import invoice from "$lib/invoice";
import getRates from "$lib/rates";
import { auth, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ cookies, parent }) {
	const rates = await getRates();
	const { invoice, subject, user } = await parent();
	if (!invoice.amount) redirect(307, `/invoice/${invoice.id}`);
	const pin = cookies.get("pin");

	if (user) {
		const trust = await get("/trust", auth(cookies));
		const trusted = trust.includes(invoice.uid);
		if (trusted && (pin || !user.haspin) && user.tip > 0) {
			let p;
			try {
				p = await post("/payments", { ...invoice, pin }, auth(cookies));
			} catch (e) {
				const { message } = e as Error;
				fail(400, { message });
			}

			if (p) redirect(307, `/sent/${p.id}`);
		}
	}

	const rate = rates[subject?.currency];
	const invoiceRate = rates[invoice.currency];
	return { rate, invoiceRate };
}

export const actions = {
	default: invoice,
};
