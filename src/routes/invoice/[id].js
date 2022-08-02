import { get } from '$lib/utils';

export async function GET({ params }) {
	let { id } = params;
	let {
		amount,
		rate,
		text,
		user: { username }
	} = await get(`/invoice?uuid=${id}`);

	return { body: { amount, rate, username, text } };
}
