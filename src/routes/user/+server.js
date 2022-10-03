import { auth, post } from '$lib/utils';
import cookie from 'cookie';

export async function PUT({ cookies, request }) {
	let user = await request.json();
	let res = await post('/user', user, auth(cookies));

	let maxAge = 30 * 24 * 60 * 60;

	let expires = new Date();
	expires.setSeconds(expires.getSeconds() + maxAge);

	cookies.set('token', res.token, { expires, path: '/' });

	return new Response(JSON.stringify(res));
}
