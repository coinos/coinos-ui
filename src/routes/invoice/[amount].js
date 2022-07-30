import { post } from '$lib/utils';

const username = 'bob',
	network = 'lightning';

export async function GET({ params }) {
  let { amount } = params;
	let { text } = await post('/lightning/invoice', { amount });
	await post('/invoice', { invoice: { text, network }, user: { username } });

	return { body: { amount, text } };
}
