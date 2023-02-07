import { error, fail, redirect } from '@sveltejs/kit';
import { btc as asset, auth, get, post } from '$lib/utils';

export async function load({ params, parent }) {
	let { user } = await parent();
	let { amount } = params;
	let subject = await get(`/users/${params.username}`);
	if (subject.username === user?.username) throw error(500, { message: 'Cannot send to self' });
	return { amount, subject };
}

export const actions = {
	default: async ({ cookies, request }) => {
		try {
			let body = Object.fromEntries(await request.formData());
			let { amount, confirmed } = body;
			amount = parseInt(amount);

			if (!confirmed) {
				return fail(400, { amount, confirm: true });
			}

			await post('/payments', body, auth(cookies));
		} catch (e) {
			console.log(e);
			return fail(400, { message: e.message });
		}

		throw redirect(307, '/sent');
	}
};
