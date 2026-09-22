import { PUBLIC_DOMAIN } from "$env/static/public";
import getRates from "$lib/rates";
import { auth, fd, get, post } from "$lib/utils";
import { bech32 } from "@scure/base";
import { error, fail, redirect } from "@sveltejs/kit";
const { decode, fromWords } = bech32;

const lnurlFetch = async (url: string) =>
	get(`/lnurl/proxy?url=${encodeURIComponent(url)}`);

export async function load({ cookies, params, parent }) {
	const { user } = await parent();
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

		const urlObj = new URL(callback);
		urlObj.searchParams.set("amount", (amount * 1000).toString());
		if (comment) {
			urlObj.searchParams.set("comment", comment);
		}
		const url = urlObj.toString();

		const { pr } = await lnurlFetch(url);

		let invoice;
		try {
			invoice = await get(`/invoice/${pr}`);
		} catch (e) {}

		if (invoice) redirect(307, `/invoice/${invoice.id}`);

		let path = `/send/lightning/${pr}`;
		if (comment) path += `/${encodeURIComponent(comment)}`;
		redirect(307, path);
	} else if (url.startsWith(`https://${PUBLIC_DOMAIN}/`)) {
		const username = url.split(`https://${PUBLIC_DOMAIN}/p/`)[1];
		if (username) redirect(307, `/pay/${username}`);
	}

	if (!["payRequest", "withdrawRequest"].includes(data.tag))
		error(500, "We only support LNURLp and LNURLw at this time");

	data.rate = rates[user?.currency || "USD"];
	// Lightning sends draw on the main account; the Max button needs its balance
	if (user && data.tag === "payRequest") {
		try {
			({ balance: data.balance } = await get(`/account/${user.id}`, auth(cookies)));
		} catch (e) {}
	}
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

		const urlObj = new URL(callback);
		urlObj.searchParams.set("amount", (amount * 1000).toString());
		if (comment) urlObj.searchParams.set("comment", comment);
		const url = urlObj.toString();

		const { pr } = await lnurlFetch(url);

		let path = `/send/lightning/${pr}`;
		if (comment) path += `/${encodeURIComponent(comment)}`;
		redirect(307, path);
	},

	// Send everything to an LNURL-pay endpoint. The routing cost depends on the
	// amount and the amount on the routing cost, and the invoice only exists
	// once we name an amount — so fetch a probe invoice at the most we could
	// possibly send (its destination and route hints are what the quote needs),
	// let the server solve for the amount that lands the balance on zero, then
	// fetch the real invoice for exactly that amount.
	max: async ({ cookies, request }) => {
		let { callback, minSendable, maxSendable, comment } = await fd(request);
		minSendable = Math.round(minSendable / 1000);
		maxSendable = Math.round(maxSendable / 1000);

		const user = await get("/me", auth(cookies));
		const { balance } = await get(`/account/${user.id}`, auth(cookies));
		const ceiling = Math.min(balance, maxSendable);
		if (ceiling < minSendable)
			return fail(400, { error: `Amount must be at least ${minSendable} sats` });

		const invoiceFor = async (amount: number) => {
			const urlObj = new URL(callback);
			urlObj.searchParams.set("amount", (amount * 1000).toString());
			if (comment) urlObj.searchParams.set("comment", comment);
			const { pr, reason } = await lnurlFetch(urlObj.toString());
			if (!pr) throw new Error(reason || "Could not fetch invoice");
			return pr;
		};

		let pr;
		try {
			const probe = await invoiceFor(ceiling);
			const { amount } = await post(
				"/lightning/quote",
				{ payreq: probe, max: true, ceiling },
				auth(cookies),
			);
			if (amount < minSendable)
				return fail(400, { error: `Amount must be at least ${minSendable} sats` });
			pr = await invoiceFor(amount);
		} catch (e) {
			const { error } = e as Error & { error?: string };
			return fail(400, { error: (e as Error).message || error });
		}

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

		await lnurlFetch(url.toString());

		redirect(307, "/payments");
	},
};
