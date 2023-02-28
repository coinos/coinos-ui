import { get, post, auth, protectedRoutes } from '$lib/utils';

export async function load({ cookies, request, url, params }) {
	let token = cookies.get('token');
	let rate,
		rates = { USD: 1 };

	let user;
	if (token) {
		try {
			user = await get('/me', auth(cookies));
		} catch (e) {}
	}

	return { user };
}
