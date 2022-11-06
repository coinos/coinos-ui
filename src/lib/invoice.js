import { auth, get, post } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export default async ({ cookies, request }) => {
	let form = await request.formData();

	let rates = await get('/rates');
	let requester = form.get('requester');

	let invoice = {
		amount: parseInt(form.get('amount')),
		tip: parseInt(form.get('tip')),
		network: 'lightning',
		prompt: form.get('prompt') === 'true',
		rate: parseFloat(form.get('rate')) || rates[form.get('currency')],
		requester
	};

	let user = { username: form.get('username') };

	let { uuid } = await post('/invoice', { invoice, user }, auth(cookies));
	console.log('R', requester);

	if (requester) return { requester };

	if (invoice.prompt) {
		throw redirect(307, `/invoice/${uuid}/tip`);
	} else {
		throw redirect(307, `/invoice/${uuid}`);
	}
};
