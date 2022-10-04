import { invalid, redirect } from '@sveltejs/kit';
import { login } from '$lib/utils';

export const actions = {
	default: async ({ cookies, request }) => {
		let user = Object.fromEntries(await request.formData());
		try {
			await login(user, cookies);
			throw redirect(303, `/${user.username}/dashboard`);
		} catch (e) {
			console.log('OW');
			return invalid(403, { error: 'Login failed' });
		}
	}
};
