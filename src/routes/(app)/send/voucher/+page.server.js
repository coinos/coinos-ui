import { invalid, redirect } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

export const actions = {
	default: async ({ cookies, request }) => {
		let p;
		try {
			let body = Object.fromEntries(await request.formData());
			p = await post('/send', body, auth(cookies));
		} catch (e) {
			return invalid(400, { message: e.message });
		}

		if (p) throw redirect(307, `/voucher/${p.redeemcode}`);
	}
};
