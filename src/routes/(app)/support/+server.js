import { json } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

export const prerender = false;

export async function POST({ cookies, request }) {
	let result = await post('/email', await request.json(), auth(cookies));
	return json(result);
}
