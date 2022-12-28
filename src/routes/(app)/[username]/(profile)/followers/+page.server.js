import { get } from '$lib/utils';

export async function load({ params, parent, url }) {
	let { subject } = await parent();
	let { pubkey } = subject;

	let followers = await get(`/${pubkey}/followers`);

	return { followers };
}
