import { post } from '$lib/utils';

let network = 'lightning';

export async function POST({ request }) {
	let { amount, rate, username, text } = await request.json();
	if (!text) ({ text } = await post('/lightning/invoice', { amount }));
	let { uuid: id } = await post('/invoice', {
		invoice: { amount, currency: 'USD', network, rate, text },
		user: { username }
	});

	return { body: { id } };
}
