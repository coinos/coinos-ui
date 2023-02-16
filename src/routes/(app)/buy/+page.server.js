import { env } from '$env/dynamic/private';
import { error, redirect } from '@sveltejs/kit';
import { post, auth } from '$lib/utils';
import { createTicket } from '$lib/ticket';

export const actions = {
	default: async ({ cookies, request }) => {
		let form = await request.formData();

		await post('/buy', {
			number: form.get('number').replace(/\s+/g, ''),
			month: form.get('expiry').slice(0, 2),
			year: form.get('expiry').slice(-2),
			cvc: form.get('cvc')
		}, auth(cookies));

		throw redirect(307, `/launch/thanks/${asset}`);
	}
};
