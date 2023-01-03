import { auth, post } from '$lib/utils';
import { error, json } from '@sveltejs/kit';

export async function POST({ cookies, request }) {
	try {
		return json(await post(`/user`, await request.json(), auth(cookies)));
	} catch (e) {
		console.log(e);
		throw error(500, e.message);
	}
}
