import { get } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
	let { user } = await parent();
	if (!user) throw redirect(307, '/login');

	let users = (await get('/users')).sort((a, b) => b.balance - a.balance);
	return { users };
}
