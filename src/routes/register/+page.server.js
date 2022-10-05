import { invalid, redirect } from '@sveltejs/kit';
import { post, login } from '$lib/utils';

export const actions = {
	default: async ({ cookies, request }) => {
		let form = Object.fromEntries(await request.formData());
		let { username, password, redirect: r } = form;

		let user = { username, password };

		try {
			await post('/register', { user });
			await login(user, cookies);
		} catch (e) {
			return invalid(400, { error: e.message });
		}

		throw redirect(303, r || `/${user.username}/dashboard`);
	}
};
