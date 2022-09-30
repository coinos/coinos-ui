import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

const opts = {
	httpOnly: true,
	sameSite: 'lax',
	path: '/'
};

export async function load({ cookies }) {
	cookies.set('set-cookie', [
		cookies.serialize('token', '', {
			...opts,
			expires: new Date(0)
		}),
		cookies.serialize('refresh_token', '', {
			...opts,
			expires: new Date(0)
		})
	]);

	throw redirect(302, '/logout/done');
}
