import { auth, get, post } from '$lib/utils';

export async function POST({ request, parent }) {
	let { amount, currency, network = 'lightning', prompt, rate, tip, user } = await request.json();
	let invoice = { amount, currency, network, prompt, rate, tip };

	return new Response(JSON.stringify(await post('/invoice', { invoice, user }, auth(request))), {
		headers: { 'content-type': 'application/json' }
	});
}
