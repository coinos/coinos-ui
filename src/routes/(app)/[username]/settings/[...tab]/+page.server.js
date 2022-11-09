import { invalid, redirect } from '@sveltejs/kit';
import { auth, get, post } from '$lib/utils';

export function load({ params, url }) {
	if (url.pathname.endsWith('settings')) throw redirect(307, url.pathname + '/account');
	return params;
}

export const actions = {
	default: async ({ cookies, locals, request }) => {
		let form = Object.fromEntries(await request.formData());

		let user = {
			...locals.user,
			...form
		};

		try {
			await post(`/user`, user, auth(cookies));
		} catch (e) {
			return invalid(400, { message: e.message });
		}

		return { user, success: true };
	}
};
