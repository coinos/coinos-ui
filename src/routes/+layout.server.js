import { error, redirect } from '@sveltejs/kit';
import cookie from 'cookie';
import { protectedRoutes } from '$lib/utils';
import { get, post, auth } from '$lib/utils';
import { env } from '$env/dynamic/public';

export const { PUBLIC_BTC: btc } = env;

export async function load({ cookies, request, url, params }) {
	let token = cookies.get('token');
	let user;
	let rates;
	let subject;

	if (params.username) {
		subject = await get(`/users/${params.username}`);
	}

	if (token && token !== 'undefined') {
		try {
      console.log("GETTING USER");
			user = await get('/me', auth(cookies));
		} catch (e) {
			throw redirect(307, '/logout');
		}

		if (protectedRoutes.find((p) => url.pathname.match(p))) {
			if (user.username !== params.username) throw error(404, 'user not found');
		}

		let account = user.accounts.find((a) => a.asset === btc && !a.pubkey);
		if (account) {
			let { id } = account;
			if (user.account_id !== id) {
				user = await post('/shiftAccount', { id }, auth(cookies));
			}
		}
	}

	let rate = await get('/rate');
	rates = await get('/rates');

	return { subject, user, token, rate, rates };
}
