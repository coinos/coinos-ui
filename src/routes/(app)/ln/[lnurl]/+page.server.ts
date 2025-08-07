import { PUBLIC_DOMAIN } from "$env/static/public";
import getRates from "$lib/rates";
import { auth, fd, get, post } from "$lib/utils";
import { bech32 } from "@scure/base";
import { error, fail, redirect } from "@sveltejs/kit";
const { decode, fromWords } = bech32;

export async function load({ params, parent }) {
	const { user } = await parent();
	if (!user) redirect(307, "/register");
	const rates = await getRates();

	let data;
	const { lnurl } = params;

	const url = Buffer.from(fromWords(decode(lnurl, 20000).words)).toString();

	try {
		data = await get(`/decode?text=${lnurl}`);
	} catch (e) {
		const { message } = e as Error;
		error(500, message);
	}

	let { callback, minSendable, maxSendable, comment, tag } = data;
	if (tag === "payRequest" && minSendable === maxSendable) {
		minSendable = Math.round(minSendable / 1000);
		maxSendable = Math.round(maxSendable / 1000);
		const amount = minSendable;

		let url = `${callback}?amount=${amount * 1000}`;
		if (comment) url += `&comment=${comment}`;

		const { pr } = await fetch(url).then((r) => (r as Response).json());

		try {
			const invoice = await get(`/invoice/${pr}`);
			if (invoice) redirect(307, `/invoice/${invoice.id}`);
		} catch (e) {}

		let path = `/send/lightning/${pr}`;
		if (comment) path += `/${encodeURIComponent(comment)}`;
		redirect(307, path);
	} else if (callback.includes(PUBLIC_DOMAIN)) {
		const username = url.split(`https://${PUBLIC_DOMAIN}/p/`)[1];
		redirect(307, `/pay/${username}`);
	}

	if (!["payRequest", "withdrawRequest"].includes(data.tag))
		error(500, "We only support LNURLp and LNURLw at this time");

	data.rate = rates[user.currency];
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

		let path = `/send/lightning/${pr}`;
		if (comment) path += `/${encodeURIComponent(comment)}`;
		redirect(307, path);
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

		const url = new URL(callback);
		url.searchParams.append("k1", k1);
		url.searchParams.append("pr", pr);

		await fetch(url.toString());

		redirect(307, "/payments");
	},
};
