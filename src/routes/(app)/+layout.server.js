import { error, redirect } from '@sveltejs/kit';
import { get, post, auth } from '$lib/utils';
import { PUBLIC_BTC as btc } from '$env/static/public';

export async function load({ cookies, locals, request, url, params }) {
	url.pathname;
	let token = cookies.get('token');
	let rate,
		rates = { USD: 1 },
		subject;

	let { user } = locals;
	if (user) {
		let account = user.accounts.find((a) => a.asset === btc && !a.pubkey);
		if (account) {
			let { id } = account;
			if (user.account_id !== id) {
				user = await post('/shiftAccount', { id }, auth(cookies));
			}
		}
	}

	try {
		rate = await get('/rate');
		rates = await get('/rates');
	} catch (e) {}

	return { subject, user, token, rate, rates };
}
