import { json } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

export async function POST({ cookies, request, params }) {
	let { username } = params;
	let r = await request.json();
	let { password } = r;
	let result = await post('/reset', { password, username }, auth(cookies));
	return json(result);
}
