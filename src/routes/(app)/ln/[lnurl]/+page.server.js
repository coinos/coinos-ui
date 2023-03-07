import { fd, auth, get, post } from '$lib/utils';
import { error, fail, redirect } from '@sveltejs/kit';

export async function load({ params, parent }) {
	let { user } = await parent();
	if (!user) throw redirect(307, '/register');

	let data;

	try {
		let { lnurl } = params;
		data = await get(`/decode?text=${lnurl}`);
	} catch (e) {
		throw error(500, e.message);
	}

	if (!['payRequest', 'withdrawRequest'].includes(data.tag))
		throw error(500, 'We only support LNURLp and LNURLw at this time');

	return data;
}

export const actions = {
	pay: async ({ cookies, fetch, request }) => {
		let error;

		let { callback, amount, minSendable, maxSendable } = await fd(request);
		minSendable = Math.round(minSendable / 1000);
		maxSendable = Math.round(maxSendable / 1000);

		if (amount < minSendable) error = `Amount must be at least ${minSendable} sats`;
		if (amount > maxSendable) error = `Amount must be at most ${maxSendable} sats`;
		if (error) return fail(400, { error });

		let { pr } = await fetch(`${callback}?amount=${amount * 1000}`).then((r) => r.json());
		throw redirect(307, `/send/lightning/${pr}`);
	},

	withdraw: async ({ cookies, fetch, request }) => {
		let error;

		let { callback, amount, username, currency, minWithdrawable, maxWithdrawable, k1 } = await fd(
			request
		);

		minWithdrawable = Math.round(minWithdrawable / 1000);
		maxWithdrawable = Math.round(maxWithdrawable / 1000);

		if (amount < minWithdrawable) error = `Amount must be at least ${minWithdrawable} sats`;
		if (amount > maxWithdrawable) error = `Amount must be at most ${maxWithdrawable} sats`;
		if (error) return fail(400, { error });

		let invoice = { amount, type: 'lightning' };
		let user = { username, currency };

		let { text: pr } = await post('/invoice', { invoice, user }, auth(cookies));

		let c = callback.includes('?') ? '&' : '?';
		await fetch(`${callback}${c}k1=${k1}&pr=${pr}`).then((r) => r.json());

		throw redirect(307, `/ln/withdrawal/sent`);
	}
};
