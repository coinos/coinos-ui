import { auth, get, post } from '$lib/utils';
import tickets from '$lib/tickets';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { invalidateAll } from '$app/navigation';
import { browser } from '$app/environment';

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
		let username = form.get('username');

		let { address } = await post(
			'/invoice',
			{ invoice: { network: 'liquid' }, user: { username } },
			auth(cookies)
		);

		let { ticket } = await get('/ticket');

		let { asset } = await post(
			'/assets',
			{
				address,
				name: `Launch Party Ticket ${ticket}`,
				ticker: 'LPT',
				precision: 0,
				asset_amount: '1',
				token_amount: 0,
				domain: 'coinos.io',
				filename: tickets[ticket]
			},
			{ authorization: `Bearer ${env.LAUNCH}` }
		);

		await post('/send', { amount: 25000, username: 'launch' }, auth(cookies));
		await post('/ticket', { asset }, { authorization: `Bearer ${env.LAUNCH}` });

		throw redirect(307, `/launch/thanks/${asset}`);
	},

	lightning: async ({ cookies, request }) => {
		let form = await request.formData();

		let rates = await get('/rates');

		let invoice = {
			amount: 25000,
			memo: 'launch',
			network: 'lightning',
			prompt: false,
			rate: rates[form.get('currency')]
		};

		let user = { username: form.get('username') };

		let { uuid } = await post('/invoice', { invoice, user }, auth(cookies));

		throw redirect(307, `/invoice/${uuid}`);
	},
	bitcoin: () => console.log('YYEAH')
};

export async function POST({ request }) {
	let { address, amount, confirmed } = await request.json();
	if (!confirmed) return;

	if (request.headers.get('x-webhook') !== env.WEBHOOK) {
		throw new Error('access denied');
	}

	let username = invoices[address];
	amount = Math.round(amount / 2100);

	await post('/send', { username, asset, amount }, { authorization: `Bearer ${token}` });
}
