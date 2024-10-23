import { auth, fd, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ params: { address, amount, feeRate }, cookies }) {
	const aid = cookies.get("aid");

	try {
		const { fee, fees, inputs, ourfee, hex } = await post(
			"/bitcoin/fee",
			{ address, amount, feeRate, aid },
			auth(cookies),
		);

		const account = await get(`/account/${aid}`, auth(cookies));

		return {
			account,
			amount,
			address,
			fee,
			fees,
			feeRate,
			ourfee,
			hex,
			inputs,
		};
	} catch (e: any) {
		return { amount, address, feeRate, message: e.message };
	}
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
			p = await post("/bitcoin/send", body, auth(cookies));
		} catch (e: any) {
			console.log("problem sending bitcoin", e);
			return fail(400, { address, amount, feeRate, message: e.message });
		}

		redirect(307, `/sent/${p.id}`);
	},
};
