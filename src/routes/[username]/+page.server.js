import cookie from 'cookie';
import { get, post } from '$lib/utils';

export async function load({ params }) {
	let { username } = params;
	return get(`/users/${username}`);
}

export async function PUT({ request }) {
	let { token } = cookie.parse(request.headers.get('cookie') || '');
	let { user } = await request.json();
	await post(`/user`, user, { authorization: `Bearer ${token}` });
}
