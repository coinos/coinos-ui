import { invalid } from '@sveltejs/kit';
import { auth, get, post } from '$lib/utils';
export const actions = {
	default: async ({ cookies, locals, request }) => {
		let form = Object.fromEntries(await request.formData());

		let user = {
			...locals.user,
			...form
		};

		try {
			await post(`/user`, user, auth(cookies));
		} catch (e) {
			return invalid(400, { message: e.message });
		}

		return { user, success: true };
	}
};
