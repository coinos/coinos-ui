import { post } from '$lib/utils';

const username = 'bob',
	network = 'lightning';

export async function GET({ params }) {
	let { amount } = params;
	console.log('AMT', amount);
	let { text } = await post('/lightning/invoice', { amount });
	console.log('TXT', text);
	await post('/invoice', { invoice: { text, network }, user: { username } });

	return { body: { amount, text } };
}
