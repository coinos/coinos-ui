import { error, fail, redirect } from '@sveltejs/kit';
import { types, sats, fd, auth, get, post } from '$lib/utils';

export async function load({ cookies, params, parent }) {
	let subject = await get(`/users/${params.username}`);

	let { rates, user } = await parent();
	let { username } = params;
	let [amount, currency] = params.amount.split('/');

	if (subject.username === user?.username) throw error(500, { message: 'Cannot send to self' });

	let rate;
	if (amount) {
		rate = rates[currency ? currency.toUpperCase() : subject.currency];
		if (!rate) throw error(500, 'Invalid currency symbol');
		if (currency) amount = (amount * sats) / rate;

		let { hash } = await post(
			'/invoice',
			{
				invoice: { amount, prompt: false, type: types.lightning },
				user: { username }
			},
			auth(cookies)
		);

		throw redirect(307, `/${username}/invoice/${hash}`);
	}

	return { amount, rate, subject };
}

export const actions = {
	default: async ({ cookies, request }) => {
		try {
			let body = await fd(request);
			await post('/payments', body, auth(cookies));
		} catch (e) {
			console.log(e);
			return fail(400, { message: e.message });
		}

		throw redirect(307, '/sent');
	}
};
