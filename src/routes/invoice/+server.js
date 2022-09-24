import { auth, get, post } from '$lib/utils';

export async function POST({ request, parent }) {
	let { amount, currency, network = 'lightning', rate, tip, username } = await request.json();
	let invoice = { amount, currency, network, rate, tip };

	if (network === 'lightning') {
		invoice.text = await post('/lightning/invoice', { amount }, auth(request));
	} else {
		invoice.address = (await parent()).user.address;
	}

	return new Response(
		JSON.stringify(await post('/invoice', { invoice, user: { username } }, auth(request))),
		{ headers: { 'content-type': 'application/json' } }
	);
}
