import { auth, get } from '$lib/utils';

export async function handle({ event, resolve }) {
	let token = event.cookies.get('token');

	if (token) {
		try {
			event.locals.user = await get('/me', auth(event.cookies));
		} catch (e) {
			console.log('failed to get user', e);
		}
	}

	const response = await resolve(event);

	return response;
}
