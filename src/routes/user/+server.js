import { auth, post } from '$lib/utils';
import cookie from 'cookie';

export async function PUT({ request, setHeaders }) {
	console.log(setHeaders);
	let user = await request.json();
	let res = await post('/user', user, auth(request));

	let maxAge = 30 * 24 * 60 * 60;

	let expires = new Date();
	expires.setSeconds(expires.getSeconds() + maxAge);

	setHeaders({
		'content-type': 'application/json',
		'set-cookie': cookie.serialize('token', res.token, {
			httpOnly: true,
			maxAge,
			sameSite: 'lax',
			path: '/',
			expires
		})
	});

	return new Response(JSON.stringify(res));
}
