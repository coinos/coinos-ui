import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

const opts = {
	httpOnly: true,
	sameSite: 'lax',
	path: '/'
};

export async function load({ request: { headers } }) {
	setHeaders({
		'set-cookie': [
			cookie.serialize('token', '', {
				...opts,
				expires: new Date(0)
			}),
			cookie.serialize('refresh_token', '', {
				...opts,
				expires: new Date(0)
			})
		]
	});

	throw redirect(302, '/logout/done');
}
