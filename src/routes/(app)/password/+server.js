import { json } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

export async function POST({ cookies, request }) {
	let result = await post('/checkPassword', await request.json(), auth(cookies));
	return json(result);
}

