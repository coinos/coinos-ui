import { auth, get, post } from '$lib/utils';
import tickets from '$lib/tickets';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { invalidateAll } from '$app/navigation';
import { browser } from '$app/environment';
import { createTicket } from '$lib/ticket';

export const load = async ({ parent }) => {
	let tickets = await get('/tickets');
	let { user } = await parent();
	let hasTicket = !!user?.accounts.find((a) => tickets.includes(a.asset));
	if (hasTicket) throw redirect(307, '/launch/ticket');
	return { tickets };
};

export const actions = {
	internal: async ({ cookies, request }) => {
		let form = await request.formData();
		let asset = await createTicket(cookies, form.get('username'));
		await post('/send', { amount: 22000, username: 'launch' }, auth(cookies));

		throw redirect(307, `/launch/thanks/${asset}`);
	},

	lightning: async ({ cookies, request }) => {
		let form = await request.formData();

		let rates = await get('/rates');

		let invoice = {
			amount: 22000,
			memo: 'launch',
			network: 'lightning',
			prompt: false,
			rate: rates[form.get('currency')]
		};

		let user = { username: form.get('username') };

		let { uuid } = await post('/invoice', { invoice, user }, auth(cookies));

		throw redirect(307, `/invoice/${uuid}`);
	}
};
