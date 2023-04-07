import { error, fail, redirect } from '@sveltejs/kit';
import { fd, auth, get, post } from '$lib/utils';

export async function load({ params: { id }, parent, url }) {
	let { user } = await parent();

	let {
		amount,
		address,
		currency,
		hash,
		rate,
		prompt,
		tip,
		text,
		user: recipient
	} = await get(`/invoice/${id}`);

	if (prompt && tip === null) throw redirect(307, `/${recipient.username}/invoice/${id}/tip`);
	if (recipient.username === user.username) throw error(500, { message: 'Cannot send to self' });
	return { amount, address, currency, hash, tip, rate, payreq: text, recipient };
}

export const actions = {
	default: async ({ cookies, params: { id }, request }) => {
		try {
			let body = await fd(request);
			body.hash = id;

			await post('/payments', body, auth(cookies));
		} catch (e) {
			return fail(400, { message: e.message });
		}

		throw redirect(307, '/sent');
	}
};
