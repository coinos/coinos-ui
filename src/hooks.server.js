import { auth, get, protectedRoutes } from '$lib/utils';

export async function handle({ event, resolve }) {
	let token = event.cookies.get('token');
	let {
		params,
		request,
		url: { pathname, origin }
	} = event;

	let user;
	if (token && pathname !== '/logout') {
		try {
			user = await get('/me', auth(event.cookies));
			event.locals.user = user;

			if (['/', '/login', '/register'].includes(pathname) && request.method === 'GET')
				return Response.redirect(origin + `/${user.username}/dashboard`, 307);
		} catch (e) {
			return Response.redirect(origin + '/logout', 307);
		}
	}

	if (protectedRoutes.find((p) => pathname.match(p))) {
		if (!user || user.username !== params.username)
			return Response.redirect(origin + '/login', 307);
	}

	const response = await resolve(event);

	return response;
}
