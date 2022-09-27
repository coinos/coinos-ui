import { get } from '$lib/utils';

export async function load({ params }) {
	console.log('PARAMS', params);
	let { id } = params;
	return { id, invoice: await get(`/invoice?uuid=${id}`) };
}
