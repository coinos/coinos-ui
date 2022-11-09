import { error } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

export async function POST({ cookies, request }) {
	try {
		let body = await request.json();
		let res = await post('/disable2fa', body, auth(cookies));

		return new Response(JSON.stringify(res));
	} catch (e) {
		throw error(500, 'Problem disabling 2fa');
	}
}
