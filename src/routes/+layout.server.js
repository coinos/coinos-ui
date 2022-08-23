import { error } from '@sveltejs/kit';
import cookie from 'cookie';
import { protectedRoutes } from '$lib/utils';
import { get } from '$lib/utils';

export async function load({ request, setHeaders, url, params }) {
	let { token } = cookie.parse(request.headers.get('cookie') || '');
	let user;
	let rates;

	if (token) {
		user = await get('/me', { accept: 'application/json', authorization: `Bearer ${token}` });
		if (protectedRoutes.find((p) => url.pathname.match(p))) {
			if (user.username !== params.username) throw error(404, 'user not found');
		}
	}

	rates = await get('/rates');

	return { user, token, rates };
}
