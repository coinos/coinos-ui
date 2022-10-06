import { error, invalid, redirect } from '@sveltejs/kit';
import { btc as asset, auth, get, post } from '$lib/utils';

export async function load({ params, parent }) {
	let { user } = await parent();
	let { amount, address, text, user: recipient } = await get(`/invoice/${params.uuid}`);
	if (recipient.username === user.username) throw error(500, { message: 'Cannot send to self' });
	return { amount, address, payreq: text, recipient };
}

export const actions = {
	default: async ({ cookies, params, request }) => {
		let body = Object.fromEntries(await request.formData());
		let { confirmed } = body;

		if (!confirmed) {
			return invalid(403, { amount, confirm: true });
		}

		await post('/send', body, auth(cookies));
		throw redirect(307, '/sent');
	}
};
