import { redirect } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

export const actions = {
	default: async ({ cookies, request }) => {
		let { address, amount } = Object.fromEntries(await request.formData());
		let { tx } = await post('/bitcoin/fee', { address, amount }, auth(cookies));
		await post('/bitcoin/send', { address, tx }, auth(cookies));
		throw redirect(307, '/sent');
	}
};
