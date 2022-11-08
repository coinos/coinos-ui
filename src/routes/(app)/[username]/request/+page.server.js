import { redirect } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

export let load = ({ locals }) => {
	if (!locals.user) throw redirect(307, '/login');
};

export const actions = {
	default: async ({ cookies, request, url }) => {
		let form = Object.fromEntries(await request.formData());
		await post('/requests', form, auth(cookies));
		throw redirect(307, url.href + '/sent');
	}
};
