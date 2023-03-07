import { fail, redirect } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

export const actions = {
	default: async ({ cookies, request }) => {
		let body = await fd(request);
		let p;

		try {
			p = await post('/payments', body, auth(cookies));
		} catch (e) {
			return fail(400, { message: e.message });
		}

		if (p) throw redirect(307, `/pot/${body.name}`);
	}
};
