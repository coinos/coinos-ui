import { redirect } from '@sveltejs/kit';
import { post, login } from '$lib/utils';

export const actions = {
	default: async ({ cookie, request }) => {
		let form = Object.fromEntries(await request.formData());
		let { username, password, redirect: r } = form;

		let user = { username, password };
		await post('/register', { user });
		await login(user, cookie);

		throw redirect(303, r || `/${user.username}/dashboard`);
	}
};
