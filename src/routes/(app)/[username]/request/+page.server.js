import { redirect } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

export let load = ({ locals, params }) => {
	if (!locals.user) redirect(307, '/login');
	let { username } = params;
};

export const actions = {
	default: async ({ cookies, request, url }) => {
		let form = Object.fromEntries(await request.formData());
		await post('/requests', form, auth(cookies));
		throw redirect(307, url.href + '/sent');
	}
};
