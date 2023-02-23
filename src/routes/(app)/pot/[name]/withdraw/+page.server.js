import { fail, redirect } from '@sveltejs/kit';
import { fd, auth, post } from '$lib/utils';

export async function load({ parent }) {
	let { user } = await parent();
	if (!user) throw redirect(307, '/register');
}

export const actions = {
	default: async ({ cookies, request }) => {
		let body = await fd(request);
		try {
			await post('/take', body, auth(cookies));
		} catch (e) {
			return fail(400, { message: e.message });
		}

		throw redirect(307, `/pot/${body.name}`);
	}
};
