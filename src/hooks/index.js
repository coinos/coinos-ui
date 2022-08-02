import cookie from 'cookie';
import { get } from '$lib/utils';
import { protectedRoutes } from '$lib/utils';

export async function handle({ event, resolve }) {
	let {
		params,
		request: { headers }
	} = event;

	const cookies = cookie.parse(headers.get('cookie') || '');
	let { token } = cookies;
	event.locals = { token };

	if (protectedRoutes.find((p) => event.url.pathname.match(p))) {
		let user = await get('/me', { accept: 'application/json', authorization: `Bearer ${token}` });
		if (user.username !== params.username) throw new Error('user not found');
	}

	return resolve(event);
}

export const getSession = ({ locals: { token } }) => {
	return { token };
};
