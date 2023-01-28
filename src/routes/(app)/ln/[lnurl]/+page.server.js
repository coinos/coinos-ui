import { auth, get, post } from '$lib/utils';
import { error, fail, redirect } from '@sveltejs/kit';

export async function load({ params }) {
	try {
		let { lnurl } = params;
		let data = await get(`/decode?text=${lnurl}`);
		if (data.tag === 'payRequest') throw redirect('/lnurlp');
		throw error(500, 'We can only handle lnurl pay requests');
		return data;
	} catch (e) {
		throw error(500, e.message);
	}
}

export const actions = {
	pay: async ({ cookies, fetch, request }) => {
		let error;

		let { callback, amount, minSendable, maxSendable } = Object.fromEntries(
			await request.formData()
		);

		if (amount < minSendable) error = `Amount must be at least ${minSendable} sats`;
		if (amount > maxSendable) error = `Amount must be at most ${maxSendable} sats`;
		if (error) return fail(400, { error });

		let { pr } = await fetch(`${callback}?amount=${amount}`).then((r) => r.json());
		throw redirect(307, `/send/lightning/${pr}`);
	},

	withdraw: async ({ cookies, fetch, request }) => {
		let error;

		let { callback, amount, minWithdrawable, maxWithdrawable, k1 } = Object.fromEntries(
			await request.formData()
		);

		if (amount < minWithdrawable) error = `Amount must be at least ${minWithdrawable} sats`;
		if (amount > maxWithdrawable) error = `Amount must be at most ${maxWithdrawable} sats`;
		if (error) return fail(400, { error });

		let invoice = { amount, type: 'lightning' };
		let user = { username: form.get('username'), currency: form.get('currency') };

		let { text: pr } = await post('/invoice', { invoice, user }, auth(cookies));

		let c = callback.includes('?') ? '&' : '?';
		await fetch(`${callback}${c}k1=${k1}&pr=${pr}`).then((r) => r.json());

		throw redirect(307, `/ln/withdrawal/sent`);
	}
};
