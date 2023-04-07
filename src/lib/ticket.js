import { auth, get, post } from '$lib/utils';
import { env } from '$env/dynamic/private';
import tickets from '$lib/tickets';

export const createTicket = async (cookies, username) => {
	let { ticket } = await get('/ticket');

	let { address } = await post(
		`/${username}/invoice`,
		{ invoice: { network: 'liquid' }, user: { username } },
		auth(cookies)
	);

	let { asset } = await post(
		'/assets',
		{
			address,
			name: `Launch Party Ticket ${ticket}`,
			ticker: 'LPT',
			precision: 0,
			asset_amount: '1',
			token_amount: 0,
			domain: 'hashme.io',
			filename: tickets[ticket]
		},
		{ authorization: `Bearer ${env.LAUNCH}` }
	);

	await post('/ticket', { asset }, { authorization: `Bearer ${env.LAUNCH}` });
	return asset;
};
