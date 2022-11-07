import { auth, get, post } from '$lib/utils';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
	if (!locals.user) throw redirect(307, '/login');
	let { lnurl } = params;
	lnurl = await get(`/decode?text=${lnurl}`);
	if (lnurl.tag !== 'payRequest') throw error(500, 'We can only handle lnurl pay requests');

	return lnurl;
}

export const actions = {
	default: async ({ cookies, request }) => {
		let { callback, ...form } = Object.fromEntries(await request.formData());
		form.params = { callback };
		await post('/pay', form, auth(cookies));
	}
};
