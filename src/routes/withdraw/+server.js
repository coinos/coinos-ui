import { auth, post } from '$lib/utils';

export async function POST({ request }) {
	let body = await request.json();
	await post('/lightning/send', body, auth(request));

	return new Response(JSON.stringify("ok"), { headers: { 'content-type': 'application/json' } });
}
