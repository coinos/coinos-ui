import { post } from '$lib/utils';

let network = 'lightning';

export async function POST({ request }) {
  let { amount, username } = await request.json();
	let { text } = await post('/lightning/invoice', );
	let { uuid: id } = await post('/invoice', { invoice: { text, network }, user: { username } });

	return { body: { id } };
}
