import { redirect } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

export let load = ({ locals }) => {
	console.log('YO');
	if (!locals.user) throw redirect(307, '/login');
};

export const actions = {
	create: async ({ cookies, locals, request, url }) => {
		let form = Object.fromEntries(await request.formData());
		let { id } = await post('/requests', form, auth(cookies));
		throw redirect(307, `/${locals.user.username}/request/${id}`);
	},

	delete: async ({ cookies, request }) => {
		let form = Object.fromEntries(await request.formData());
		let r = await post('/requests/delete', form, auth(cookies));
	}
};
