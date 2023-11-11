import { json } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

export async function POST({ cookies, request }) {
	return json(await post('/take', await request.json(), auth(cookies)));
}
