import { redirect } from '@sveltejs/kit';
import { btc as asset, auth, post } from '$lib/utils';

export const actions = {
	default: async ({ request }) => {
		let { address, amount } = Object.fromEntries(await request.formData());
		let { tx } = await post('/bitcoin/fee', { address, amount, asset }, auth(request));
		await post('/bitcoin/send', { address, tx }, auth(request));
		throw redirect(307, '/sent');
	}
};
