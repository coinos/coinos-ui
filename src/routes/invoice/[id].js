import { get } from '$lib/utils';

const username = 'bob',
	network = 'lightning';

export async function GET({ params }) {
	let { id } = params;
	let { amount, text } = await get(`/invoice?uuid=${id}`);

	return { body: { amount, text } };
}
