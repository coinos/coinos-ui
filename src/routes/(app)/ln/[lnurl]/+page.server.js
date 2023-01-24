import { auth, get, post } from '$lib/utils';
import { error, invalid, redirect } from '@sveltejs/kit';

export async function load({ params }) {
	try {
		let { lnurl } = params;
		let data = await get(`/decode?text=${lnurl}`);
		if (data.tag !== 'payRequest') throw error(500, 'We can only handle lnurl pay requests');
		return data;
	} catch (e) {
		throw error(500, e.message);
	}
}

export const actions = {
	default: async ({ cookies, fetch, request }) => {
		let error;

		let { callback, amount, minSendable, maxSendable } = Object.fromEntries(
			await request.formData()
		);

		if (amount < minSendable) error = `Amount must be at least ${minSendable} sats`;
		if (amount > maxSendable) error = `Amount must be at most ${maxSendable} sats`;
		if (error) return invalid(400, { error });

		let { pr } = await fetch(`${callback}?amount=${amount}`).then((r) => r.json());
		throw redirect(307, `/send/lightning/${pr}`);
	}
};
