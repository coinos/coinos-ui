import { get } from '$lib/utils';

export async function load({ params }) {
	let { id } = params;
	let {
		amount,
		rate,
		status,
		text,
		user: { username }
	} = await get(`/invoice?uuid=${id}`);

	return { amount, id, rate, username, status, text };
}
