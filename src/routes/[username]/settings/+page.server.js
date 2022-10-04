import { invalid } from '@sveltejs/kit';
import { auth, get, post } from '$lib/utils';

export const actions = {
	default: async ({ cookies, request }) => {
		let user = {
			...(await get('/me', auth(cookies))),
			...Object.fromEntries(await request.formData())
		};
		try {
			await post(`/user`, user, auth(cookies));
		} catch (e) {
			return invalid(400, { message: e.message });
		}

		return { success: true };
	}
};
