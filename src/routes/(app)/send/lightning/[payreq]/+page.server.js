import { fail, redirect } from '@sveltejs/kit';
import { fd, btc as asset, auth, post } from '$lib/utils';

export async function load({ params }) {
	return post('/parse', params);
}

export const actions = {
	setAmount: async ({ cookies, request }) => fd(request),

	send: async ({ cookies, request }) => {
		try {
			let body = await fd(request);
			let { amount } = body;

			await post('/payments', body, auth(cookies));
		} catch (e) {
			if (e.message.includes('unusable'))
				e.message = 'Failed to route payment, try sending a lower amount';
			return fail(400, { message: e.message });
		}

		throw redirect(307, '/sent');
	}
};
