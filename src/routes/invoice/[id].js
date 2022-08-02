import { get } from '$lib/utils';

export async function GET({ params }) {
	let { id } = params;
	let {
		amount,
		rate,
		status,
		text,
		user: { username }
	} = await get(`/invoice?uuid=${id}`);

	return { body: { amount, id, rate, username, status, text } };
}
