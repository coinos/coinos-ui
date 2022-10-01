import { redirect } from '@sveltejs/kit';
import { btc as asset, auth, post } from '$lib/utils';

export async function load({ params }) {
	return post('/lightning/parse', params);
}

export const actions = {
	default: async ({ request }) => {
		let body = Object.fromEntries(await request.formData());
		await post('/lightning/send', body, auth(request));
		throw redirect(307, '/sent');
	}
};
