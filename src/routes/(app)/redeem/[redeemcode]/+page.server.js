import { error, redirect } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

export async function load({ cookies, locals, params }) {
	let { user } = locals;

	if (user) {
		await post('/redeem', params, auth(cookies));
		throw redirect(307, `/${user.username}/transactions`);
	}

	throw redirect(307, '/login');
}
