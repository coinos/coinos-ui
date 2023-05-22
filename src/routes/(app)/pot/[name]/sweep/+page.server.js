import { get, auth, post } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies, params, parent }) {
	let { user } = await parent();
	let { name } = params;
	let { amount } = await get(`/pot/${name}`);


  if (!amount) throw redirect(307, `/pot/${name}`);
	if (!user) throw redirect(307, `/register?redirect=/pot/${name}/sweep`);
	await post('/take', { amount, name }, auth(cookies));
	return { amount, name };
}
