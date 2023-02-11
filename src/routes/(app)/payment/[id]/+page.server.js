import { auth, get } from '$lib/utils';

export async function load({ cookies, params }) {
	let payment = await get(`/payments/${params.id}`, auth(cookies));
	return { payment };
}
