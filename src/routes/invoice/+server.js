import cookie from 'cookie';
import { get, post } from '$lib/utils';

export async function POST({ request }) {
	let { token } = cookie.parse(request.headers.get('cookie') || '');

	let network = 'lightning';
	let { amount, currency, rate, tip, text, username } = await request.json();
	let headers = { authorization: `Bearer ${token}` };

	({ text } = await post('/lightning/invoice', { amount }, headers));
	let invoice = { amount, currency, network, rate, tip, text };
	let { uuid }  = await post('/invoice', { invoice, user: { username } }, headers);

	return new Response(JSON.stringify(uuid), { headers: { 'content-type': 'application/json' } });
}
