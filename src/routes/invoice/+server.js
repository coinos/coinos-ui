import { auth, get, post } from '$lib/utils';

export async function POST({ request }) {
	let network = 'lightning';
	let { amount, currency, rate, tip, text, username } = await request.json();
	({ text } = await post('/lightning/invoice', { amount }, auth(request)));
	let invoice = { amount, currency, network, rate, tip, text };
	let { uuid } = await post('/invoice', { invoice, user: { username } }, auth(request));

	return new Response(JSON.stringify(uuid), { headers: { 'content-type': 'application/json' } });
}
