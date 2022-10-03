import { auth, post } from '$lib/utils';

export async function PUT({ cookies, request }) {
	let body = await request.json();
	let res = await post('/2fa', body, auth(cookies));

	return new Response(JSON.stringify(res));
}
