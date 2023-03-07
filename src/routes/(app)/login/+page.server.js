import { fail, redirect } from '@sveltejs/kit';
import { login, fd } from '$lib/utils';

export const load = async ({ parent }) => {
	let { user } = await parent();
	if (user?.pubkey) throw redirect(307, `/${user.username}`);
};

export const actions = {
	default: async ({ cookies, request }) => {
		let form = await fd(request);
		let { username, password, token, loginRedirect } = form;
		let user = { username, password, token };

		if (loginRedirect === 'undefined') loginRedirect = undefined;

		try {
			let r = await login(user, cookies);
		} catch (e) {
			return fail(400, { error: 'Login failed', message: e.message, ...form });
		}

		throw redirect(303, loginRedirect || `/${user.username}`);
	}
};
