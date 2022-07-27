import { post } from '$lib/utils';
import { invoiceAmount } from '$lib/store';

const username = 'bob',
	network = 'lightning';

export async function GET({ params }) {
	let { text } = await post('/lightning/invoice', { amount: invoiceAmount });
	await post('/invoice', { invoice: { text, network }, user: { username } });

	return { body: { text } };
}
