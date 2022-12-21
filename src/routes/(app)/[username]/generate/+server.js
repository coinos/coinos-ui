import { auth, post } from '$lib/utils';
import { json } from '@sveltejs/kit';

export async function POST({ cookies, request }) {
	let body = await request.json();
	let user = await post(`/user`, body, auth(cookies));
	return json(user);
}
