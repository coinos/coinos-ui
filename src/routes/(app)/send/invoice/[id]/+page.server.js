import { error, fail, redirect } from '@sveltejs/kit';
import { btc as asset, auth, get, post } from '$lib/utils';

export async function load({ params: { id }, parent }) {
	let { user } = await parent();

	let { amount, address, tip, text, user: recipient } = await get(`/invoice/${id}`);
	if (recipient.username === user.username) throw error(500, { message: 'Cannot send to self' });
	if (tip) amount += tip;
	return { amount, address, payreq: text, recipient };
}

export const actions = {
	default: async ({ cookies, params: { hash }, request }) => {
		try {
			let body = Object.fromEntries(await request.formData());
			let { confirmed } = body;
			body.amount = parseInt(body.amount);
			body.hash = hash;

			if (!confirmed) {
				return fail(400, { amount, confirm: true });
			}

			await post('/payments', body, auth(cookies));
		} catch (e) {
			return fail(400, { message: e.message });
		}

		throw redirect(307, '/sent');
	}
};
