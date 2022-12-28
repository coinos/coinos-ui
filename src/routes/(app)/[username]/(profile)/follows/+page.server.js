import { get } from '$lib/utils';

export async function load({ params, parent, url }) {
	let { subject } = await parent();
	let { pubkey } = subject;

	let follows = await get(`/${pubkey}/follows`);

	console.log('GOT', follows);
	return { follows };
}
