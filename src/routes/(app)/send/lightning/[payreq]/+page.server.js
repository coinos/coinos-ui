import { fail, redirect } from '@sveltejs/kit';
import { btc as asset, auth, post } from '$lib/utils';

export async function load({ params }) {
	return post('/parse', params);
}

export const actions = {
	setAmount: async ({ cookies, request }) => {
		return Object.fromEntries(await request.formData());
	},

	send: async ({ cookies, request }) => {
		try {
			let body = Object.fromEntries(await request.formData());
			let { amount, confirmed } = body;

			if (!confirmed) {
				return fail(400, { amount, confirm: true });
			}

			await post('/payments', body, auth(cookies));
		} catch (e) {
			if (e.message.includes('unusable'))
				e.message = 'Failed to route payment, try sending a lower amount';
			return fail(400, { message: e.message });
		}

		throw redirect(307, '/sent');
	}
};
