import { auth, get, post } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies, params, parent }) {
	let user = (await parent()).subject;
	let rates = await get('/rates');
	let invoice = {
		network: 'bitcoin',
		rate: rates[user.currency]
	};
	let { uuid } = await post('/invoice', { invoice, user }, auth(cookies));
	throw redirect(307, `/invoice/${uuid}`);
}
