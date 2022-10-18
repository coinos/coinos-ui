import { invalid, redirect } from '@sveltejs/kit';
import { login } from '$lib/utils';

export const actions = {
	default: async ({ cookies, request }) => {
		let form = Object.fromEntries(await request.formData());
		let { username, password, loginRedirect } = form;
		let user = { username, password };

		try {
			await login(user, cookies);
		} catch (e) {
			return invalid(400, { error: 'Login failed' });
		}

		throw redirect(303, loginRedirect || `/${user.username}/dashboard`);
	}
};
