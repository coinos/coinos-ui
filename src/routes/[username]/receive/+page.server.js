import { auth, get, post } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ cookies, request }) => {
		let form = await request.formData();

		let invoice = {
			amount: parseInt(form.get('amount')),
			network: 'lightning',
			prompt: form.get('prompt') === 'true',
			rate: await get('/rate')
		};

		let user = { username: form.get('username') };

		let { uuid } = await post('/invoice', { invoice, user }, auth(cookies));

		throw redirect(307, `/invoice/${uuid}`);
	}
};
