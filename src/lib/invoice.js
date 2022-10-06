import { auth, get, post } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export default async ({ cookies, request }) => {
	let form = await request.formData();

	let rates = await get('/rates');

	let invoice = {
		amount: parseInt(form.get('amount')),
		tip: parseInt(form.get('tip')),
		network: 'lightning',
		prompt: form.get('prompt') === 'true',
		rate: rates[form.get('currency')]
	};

	let user = { username: form.get('username') };

	let { uuid } = await post('/invoice', { invoice, user }, auth(cookies));

	throw redirect(307, `/invoice/${uuid}`);
};
