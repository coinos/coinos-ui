import { error, redirect } from '@sveltejs/kit';
import { get, post, auth, protectedRoutes } from '$lib/utils';
import { PUBLIC_BTC as btc } from '$env/static/public';

export async function load({ cookies, request, url, params }) {
	let { pathname } = url;
	let token = cookies.get('token');
	let rate,
		rates = { USD: 1 };

	let user;
	if (token) {
		try {
			user = await get('/me', auth(cookies));
		} catch (e) {}
	}

	if (user?.needsMigration) {
		throw redirect(307, `/migrate`);
	}

	if (user && ['/login', '/register'].includes(pathname) && request.method === 'GET') {
		throw redirect(307, `/${user.username}`);
	}

	if (
		protectedRoutes.find((p) => pathname.match(p)) &&
		(!user || user.username !== params.username)
	) {
		throw redirect(307, '/login');
	}

	if (user && !user.pubkey && !pathname.includes('generate'))
		throw redirect(307, `/${user.username}/generate`);

	try {
		rate = await get('/rate');
		rates = await get('/rates');
	} catch (e) {
		console.log(e);
	}

	return { user, token, rate, rates };
}
