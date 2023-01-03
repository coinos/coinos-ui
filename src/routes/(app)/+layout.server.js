import { error, redirect } from '@sveltejs/kit';
import { get, post, auth, protectedRoutes } from '$lib/utils';
import { PUBLIC_BTC as btc } from '$env/static/public';

export async function load({ cookies, request, url, params }) {
	let { pathname } = url;
	let token = cookies.get('token');
	let rate,
		rates = { USD: 1 },
		subject;

	let user;
	if (token) {
		try {
			user = await get('/me', auth(cookies));
		} catch (e) {}
	}

	if (user && ['/', '/login', '/register'].includes(pathname) && request.method === 'GET')
		throw redirect(307, `/${user.username}/dashboard`);

	if (
		protectedRoutes.find((p) => pathname.match(p)) &&
		(!user || user.username !== params.username)
	) {
		throw redirect(307, '/login');
	}

	if (user) {
		if (!user.pubkey && !url.pathname.includes('gen')) {
			throw redirect(307, `/${user.username}/generate`);
		}
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
