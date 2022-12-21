import { invalid, redirect } from '@sveltejs/kit';
import { login } from '$lib/utils';

export const load = async ({ parent }) => {
	let { user } = await parent();
	if (user?.pubkey) throw redirect(307, `/${user.username}/dashboard`);
};

export const actions = {
	default: async ({ cookies, request }) => {
		let form = Object.fromEntries(await request.formData());
		let { username, password, token, loginRedirect } = form;
		let user = { username, password, token };

		try {
			let r = await login(user, cookies);
		} catch (e) {
			return invalid(400, { error: 'Login failed', message: e.message, ...form });
		}

		throw redirect(303, loginRedirect || `/${user.username}/dashboard`);
	}
};
