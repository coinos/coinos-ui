import { auth, get, post } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export default async ({ cookies, request, url }) => {
	let form = await request.formData();

	let rates = await get('/rates');
	let amount = parseInt(form.get('amount'));
	let request_id = parseInt(form.get('request_id'));

	let invoice = {
		amount,
		tip: parseInt(form.get('tip')),
		network: form.get('network'),
		prompt: form.get('prompt') === 'true',
		rate: parseFloat(form.get('rate')) || rates[form.get('currency')],
		request_id
	};

	let user = { username: form.get('username') };

	let { uuid } = await post('/invoice', { invoice, user }, auth(cookies));

	if (request_id) {
		if (url.pathname.endsWith('tip')) {
			throw redirect(307, `/send/${uuid}`);
		}

		throw redirect(307, `/${user.username}/request/${request_id}`);
	}

	if (invoice.prompt) {
		throw redirect(307, `/invoice/${uuid}/tip`);
	} else {
		throw redirect(307, `/invoice/${uuid}`);
	}
};
