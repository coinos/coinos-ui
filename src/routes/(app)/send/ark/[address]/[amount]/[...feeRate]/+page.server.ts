import getRates from "$lib/rates";
import { auth, fd, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ params: { address, amount }, cookies, parent }) {
	const rates = await getRates();
	const { user } = await parent();
	const aid = cookies.get("aid") || user.id;

	const account = await get(`/account/${aid}`, auth(cookies));
	const rate = rates[user.currency];
	console.log("rate", rate);

	return {
		account,
		amount,
		address,
		rate,
	};
}

export const actions = {
	default: async ({
		cookies,
		params: { address, amount, feeRate },
		request,
	}) => {
		let p;
		try {
			const body = await fd(request);
			p = await post("/ark/send", { ...body, address, amount: parseInt(amount) }, auth(cookies));
		} catch (e) {
			console.log("problem sending bitcoin", e);
			const { message } = e as Error;
			return fail(400, { address, amount, feeRate, message });
		}

		redirect(307, `/sent/${p.id}`);
	},
};
