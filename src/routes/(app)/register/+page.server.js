import { fail, redirect } from '@sveltejs/kit';
import { fd, post, login } from '$lib/utils';

export const load = async ({ parent }) => {
	let { user } = await parent();
	if (user) throw redirect(307, `/${user.username}`);
};

export const actions = {
	default: async ({ cookies, request }) => {
		let form = await fd(request);
		let { username, password, cipher, salt, pubkey, loginRedirect } = form;
		let user = { username, password, cipher, salt, pubkey };
		let error;

		if (loginRedirect === 'undefined') loginRedirect = undefined;

		try {
        await post('/register', { user }, { "cf-connecting-ip": request.headers.get('cf-connecting-ip') });
		} catch (e) {
			if (e.message.includes('taken')) error = e.message;
		}

		try {
			await login(user, cookies);
			error = null;
		} catch (e) {
			error ||= e.message;
		}

		if (error) return fail(400, { error });
		throw redirect(307, loginRedirect || `/${user.username}`);
	}
};
