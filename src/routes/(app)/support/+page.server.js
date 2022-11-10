import { post } from '$lib/utils';
import { invalid } from '@sveltejs/kit';

export const actions = {
	default: async ({ cookies, request }) => {
		let form = Object.fromEntries(await request.formData());

		try {
			await post('/email', form);
		} catch (e) {
			return invalid(400, { error: e.message });
		}

		return { success: true };
	}
};
