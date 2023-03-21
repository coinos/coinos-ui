import { error, fail, redirect } from '@sveltejs/kit';
import { fd, auth, get, post } from '$lib/utils';

export async function load({ params, parent }) {
	let { user } = await parent();
  let [amount, currency] = params.amount.split('/');

	let subject = await get(`/users/${params.username}`);
	if (subject.username === user?.username) throw error(500, { message: 'Cannot send to self' });
	return { amount, currency, subject };
}

export const actions = {
	default: async ({ cookies, request }) => {
		try {
			let body = await fd(request);
			await post('/payments', body, auth(cookies));
		} catch (e) {
			console.log(e);
			return fail(400, { message: e.message });
		}

		throw redirect(307, '/sent');
	}
};
