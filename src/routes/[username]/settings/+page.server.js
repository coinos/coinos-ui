import { invalid } from '@sveltejs/kit';
import { auth, get, post } from '$lib/utils';

export const actions = {
	default: async ({ cookies, request }) => {
		let form = Object.fromEntries(await request.formData())

		let user = {
			...(await get('/me', auth(cookies))),
			...form
		};

		try {
			await post(`/user`, user, auth(cookies));
		} catch (e) {
			return invalid(400, { message: e.message });
		}

		return { success: true };
	}
};
