import { auth, get, post } from '$lib/utils';
import tickets from '$lib/tickets';
import { redirect } from "@sveltejs/kit";

export const load = async ({ parent }) => {
	let p = await parent();
	let t = await get('/ticket');
	return { ...p, ...t };
};

export const actions = {
	internal: async ({ cookies, request, parent }) => {
		let { ticket } = Object.fromEntries(await request.formData());

		let { asset } = await post(
			'/assets',
			{
				name: `Launch Party Ticket ${ticket}`,
				ticker: 'LPT',
				precision: 0,
				asset_amount: '1',
				token_amount: 0,
				domain: 'coinos.io',
				filename: tickets[ticket]
			},
			auth(cookies)
		);

    throw redirect(307, `/launch/thanks/${asset}`);
	},

	lightning: async ({ cookies, request }) => {
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
	},
	bitcoin: () => console.log('YYEAH')
};
