import { error, invalid, redirect } from '@sveltejs/kit';
import { btc as asset, auth, get, post } from '$lib/utils';

export async function load({ params, parent }) {
	let { user } = await parent();

	let { amount, address, tip, text, user: recipient } = await get(`/invoice/${params.id}`);
	if (recipient.username === user.username) throw error(500, { message: 'Cannot send to self' });
	if (tip) amount += tip;
	return { amount, address, payreq: text, recipient };
}

export const actions = {
	default: async ({ cookies, params, request }) => {
		try {
			let body = Object.fromEntries(await request.formData());
			let { confirmed } = body;

			if (!confirmed) {
				return invalid(403, { amount, confirm: true });
			}

			await post('/send', body, auth(cookies));
		} catch (e) {
			return invalid(400, { message: e.message });
		}

		throw redirect(307, '/sent');
	}
};
