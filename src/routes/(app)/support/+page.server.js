import { fd, post } from '$lib/utils';
import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ cookies, request }) => {
		let form = await fd(request);
		try {
			await post('/email', form);
		} catch (e) {
			return fail(400, { error: e.message });
		}

		return { success: true };
	}
};
