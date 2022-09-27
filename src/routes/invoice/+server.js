import { auth, get, post } from '$lib/utils';

export async function POST({ request, parent }) {
	let {
		amount,
		currency,
		network = 'lightning',
		prompt,
		rate,
		tip,
		username
	} = await request.json();
	let invoice = { amount, currency, network, prompt, rate, tip };

	if (network === 'lightning') {
		invoice.text = (await post('/lightning/invoice', { amount }, auth(request))).text;
	} else {
		invoice.address = (await get('/address?network=bitcoin&type=bech32')).address;
	}

	return new Response(
		JSON.stringify(await post('/invoice', { invoice, user: { username } }, auth(request))),
		{ headers: { 'content-type': 'application/json' } }
	);
}
