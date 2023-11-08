import { get, auth, post } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export async function load({ cookies, params, parent }) {
	let { user } = await parent();
	let { name } = params;
	let { amount } = await get(`/fund/${name}`);


  if (!amount) throw redirect(307, `/fund/${name}`);
	if (!user) throw redirect(307, `/register?redirect=/fund/${name}/sweep`);
	await post('/take', { amount, name }, auth(cookies));
	return { amount, name };
}
