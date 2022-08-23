import cookie from 'cookie';
import { get, post } from '$lib/utils';

export async function load({ params }) {
	let { id } = params;
	return { id, invoice: await get(`/invoice?uuid=${id}`) };
}

