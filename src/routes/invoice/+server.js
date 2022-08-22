import { json as json$1 } from '@sveltejs/kit';
import { post } from '$lib/utils';
import { user } from '$lib/store';

let network = 'lightning';

export async function POST({ request }) {
	let { amount, rate, username, text } = await request.json();
	if (!text) ({ text } = await post('/lightning/invoice', { amount }));
	let { uuid: id } = await post('/invoice', {
		invoice: { amount, currency: user.currency, network, rate, text },
		user: { username }
	});

	return json$1({ id });
}
