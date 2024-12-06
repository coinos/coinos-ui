import getRates from "$lib/rates";
import { auth, fd, get, post } from "$lib/utils";
import { error, fail, redirect } from "@sveltejs/kit";

export async function load({ params, parent }) {
	const { user } = await parent();
	if (!user) redirect(307, "/register");

	let data = {
		rate: await getRates()[user.currency],
	};

	try {
		const { lnurl } = params;
		data = await get(`/decode?text=${lnurl}`);
	} catch (e: any) {
		error(500, e.message);
	}

	if (!["payRequest", "withdrawRequest"].includes(data.tag))
		error(500, "We only support LNURLp and LNURLw at this time");

	return data;
}

export const actions = {
	pay: async ({ fetch, request }) => {
		let error;

		let { callback, amount, minSendable, maxSendable, comment } =
			await fd(request);
		minSendable = Math.round(minSendable / 1000);
		maxSendable = Math.round(maxSendable / 1000);

		if (amount < minSendable)
			error = `Amount must be at least ${minSendable} sats`;
		if (amount > maxSendable)
			error = `Amount must be at most ${maxSendable} sats`;
		if (error) return fail(400, { error });

		let url = `${callback}?amount=${amount * 1000}`;
		if (comment) url += `&comment=${comment}`;

		const { pr } = await fetch(url).then((r) => r.json());
		redirect(307, `/send/lightning/${pr}`);
	},

	withdraw: async ({ cookies, fetch, request }) => {
		let error;

		let {
			callback,
			amount,
			username,
			currency,
			minWithdrawable,
			maxWithdrawable,
			k1,
		} = await fd(request);

		minWithdrawable = Math.round(minWithdrawable / 1000);
		maxWithdrawable = Math.round(maxWithdrawable / 1000);

		if (amount < minWithdrawable)
			error = `Amount must be at least ${minWithdrawable} sats`;
		if (amount > maxWithdrawable)
			error = `Amount must be at most ${maxWithdrawable} sats`;
		if (error) return fail(400, { error });

		const invoice = { amount, type: "lightning" };
		const user = { username, currency };

		const { text: pr } = await post(
			"/invoice",
			{ invoice, user },
			auth(cookies),
		);

		const c = callback.includes("?") ? "&" : "?";
		await fetch(`${callback}${c}k1=${k1}&pr=${pr}`).then((r) => r.json());

		redirect(307, "/payments");
	},
};
