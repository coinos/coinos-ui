import { fail, redirect } from '@sveltejs/kit';
import { auth, get, post } from '$lib/utils';

export function load({ params, url }) {
	if (url.pathname.endsWith('settings')) throw redirect(307, url.pathname + '/account');
	return params;
}

export const actions = {
	save: async ({ cookies, request }) => {
		let form = Object.fromEntries(await request.formData());
		let user = { ...(await get('/me', auth(cookies))), ...form };

		try {
			({ user } = await post(`/user`, user, auth(cookies)));
		} catch (e) {
			return fail(400, { message: e.message });
		}

		return { user, success: true };
	},

	email: async({cookies, request }) => {
		let form = Object.fromEntries(await request.formData());
		let user = { ...(await get('/me', auth(cookies))), ...form };
		
		try {
			({ user } = await post('/email/verify', user, auth(cookies)))
		} catch (e) {
			return fail(400, { message: e.message})
		}
	}
};
