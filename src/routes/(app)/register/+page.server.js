import { invalid, redirect } from '@sveltejs/kit';
import { post, login } from '$lib/utils';

export const load = async ({ parent }) => {
	let { user } = await parent();
	if (user) throw redirect(307, `/dashboard/${user.username}`);
};

export const actions = {
	default: async ({ cookies, request }) => {
		let form = Object.fromEntries(await request.formData());
		let { username, password, cipher, salt, pubkey, loginRedirect } = form;
		let user = { username, password, cipher, salt, pubkey };
		let error;

		if (loginRedirect === 'undefined') loginRedirect = undefined;

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
