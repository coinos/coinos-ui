import { redirect } from '@sveltejs/kit';
import cookie from 'cookie';

const opts = {
	expires: new Date(0),
	path: '/'
};

export async function load({ cookies }) {
	cookies.set('token', '', opts);
	cookies.set('refresh_token', '', opts);
	throw redirect(303, '/logout/done');
}
