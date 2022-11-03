import { auth, get, protectedRoutes } from '$lib/utils';

export async function handle({ event, resolve }) {
	let token = event.cookies.get('token');
	let { params, url } = event;

	let user;
	if (token) {
		try {
			user = await get('/me', auth(event.cookies));
			event.locals.user = user;
		} catch (e) {
			console.log('failed to get user', e);
		}
	}

	if (protectedRoutes.find((p) => url.pathname.match(p))) {
		if (user?.username !== params.username) return Response.redirect(url.origin + '/login', 307);
	}

	const response = await resolve(event);

	return response;
}
