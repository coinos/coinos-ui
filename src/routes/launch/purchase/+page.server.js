import { auth, get, post } from '$lib/utils';
import tickets from "$lib/tickets";

export const load = () => get('/ticket');

export const actions = {
	default: async ({ cookies, request }) => {
		let { ticket } = Object.fromEntries(await request.formData());

		let r = await post(
			'/assets',
			{
				name: 'Launch Party Ticket',
				ticker: 'LPT',
				precision: 0,
				asset_amount: '1',
				token_amount: 0,
				domain: 'coinos.io',
        filename: tickets[ticket],
			},
			auth(cookies)
		);

		console.log(r);
	}
};
