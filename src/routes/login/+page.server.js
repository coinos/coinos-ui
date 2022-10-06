import { invalid, redirect } from '@sveltejs/kit';
import { login } from '$lib/utils';

export const actions = {
	default: async ({ cookies, request }) => {
		let user = Object.fromEntries(await request.formData());
		try {
			await login(user, cookies);
		} catch (e) {
			return invalid(400, { error: 'Login failed' });
		}

		throw redirect(303, `/${user.username}/dashboard`);
	}
};
