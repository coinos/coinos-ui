import invoice from "$lib/invoice";
import getRates from "$lib/rates";
import { auth, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent }) {
	const { id } = params;
	const rates = await getRates();
	let { invoice, subject, user } = await parent();
	if (!invoice.amount) redirect(307, `/invoice/${invoice.id}`);
	const pin = cookies.get("pin");

	if (user) {
		const trust = await get("/trust", auth(cookies));
		const trusted = trust.includes(invoice.uid);
		if (trusted && (pin || !user.haspin)) {
			let p;
			console.log("YE");
			try {
				if (invoice.tip === null && invoice.user.prompt) {
					console.log("OHH");
					if (user.tip > 0) {
						invoice.tip = Math.round(invoice.amount * (user.tip / 100));
						invoice = await post(
							"/invoice",
							{ invoice, user: subject },
							auth(cookies),
						);
					} else {
						throw new Error("tip");
					}
				}
				p = await post("/payments", { ...invoice, pin }, auth(cookies));
			} catch (e) {
				const { message } = e as Error;
				console.log("MSG", message);
				if (message === "tip") redirect(307, `/invoice/${id}/tip`);
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
