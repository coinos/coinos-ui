import { get } from '$lib/utils';

const username = 'bob',
	network = 'lightning';

export async function GET({ params }) {
	let { id } = params;
	let huh = await get(`/invoice?uuid=${id}`);
  console.log(huh)
	let { amount, rate, text } = await get(`/invoice?uuid=${id}`);

	return { body: { amount, rate, text } };
}
