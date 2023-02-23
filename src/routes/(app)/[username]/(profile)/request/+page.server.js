import { redirect } from '@sveltejs/kit';
import { fd, auth, post } from '$lib/utils';

export const actions = {
	create: async ({ cookies, params, request, url }) => {
		let form = await fd(request);
		let { id, requester } = await post('/requests', form, auth(cookies));
		throw redirect(307, `/${params.username}/request/${id}`);
	},

	delete: async ({ cookies, request }) => {
		let form = await fd(request);
		let r = await post('/requests/delete', form, auth(cookies));
	}
};
