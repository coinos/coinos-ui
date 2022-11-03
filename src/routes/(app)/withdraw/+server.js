import { auth, post } from '$lib/utils';

export async function POST({ cookies, request }) {
	let body = await request.json();
	await post('/lightning/send', body, auth(cookies));

	return new Response(JSON.stringify('ok'), { headers: { 'content-type': 'application/json' } });
}
