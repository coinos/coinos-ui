import { auth, get } from '$lib/utils';

export async function handle({ event, resolve }) {
	let token = event.cookies.get('token');
	if (token) {
		event.request.headers.set('authorization', `Bearer ${token}`);

		try {
			event.locals.user = await get('/me', auth(event.cookies));
		} catch (e) {
			console.log('failed to get user', e);
		}
	}

	const response = await resolve(event);
	response.headers.set('x-custom-header', 'potato');

	return response;
}
