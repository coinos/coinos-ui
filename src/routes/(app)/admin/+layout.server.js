import { auth, get } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies, parent }) {
	let token = cookies.get('token');
	if (!token) throw redirect(307, '/login');
	let user = await get('/me', auth(cookies));
	if (!user) throw redirect(307, '/login');

	return { user };
}
