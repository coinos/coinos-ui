import { auth, post } from '$lib/utils';
import { json } from '@sveltejs/kit';

export async function POST({ cookies, request }) {
	let body = await request.json();
	return json(post('/print', body, auth(cookies)));
}
