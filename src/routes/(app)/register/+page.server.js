import { invalid, redirect } from '@sveltejs/kit';
import { post, login } from '$lib/utils';

export const load = async ({ parent }) => {
  let { user } = await parent();
  if (user) throw redirect(307, '/dashboard');
} 

export const actions = {
	default: async ({ cookies, request }) => {
		let form = Object.fromEntries(await request.formData());
		let { username, password, loginRedirect } = form;

		let user = { username, password };
		let error;

		try {
			await post('/register', { user });
		} catch (e) {
			if (e.message.includes('taken')) error = e.message;
		}

		try {
			await login(user, cookies);
			error = null;
		} catch (e) {
			error ||= e.message;
		}

		if (error) return invalid(400, { error });
		throw redirect(307, loginRedirect || `/${user.username}/dashboard`);
	}
};
