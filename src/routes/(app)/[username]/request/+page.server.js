import { redirect } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

export const actions = {
	create: async ({ cookies, request, url }) => {
		let form = Object.fromEntries(await request.formData());
		let { id, requester } = await post('/requests', form, auth(cookies));
		throw redirect(307, `/${requester.username}/request/${id}`);
	},

	delete: async ({ cookies, request }) => {
		let form = Object.fromEntries(await request.formData());
		let r = await post('/requests/delete', form, auth(cookies));
	}
};
