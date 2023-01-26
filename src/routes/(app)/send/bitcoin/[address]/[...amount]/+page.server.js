import { fail, redirect } from '@sveltejs/kit';
import { auth, post } from '$lib/utils';

let seen = {};
export const actions = {
	default: async ({ cookies, request }) => {
		try {
			let feeRate, subtract;
			let { address, amount, pin, ts } = Object.fromEntries(await request.formData());

			if (seen[ts]) return fail(400, { message: 'Duplicate form submission' });
			seen[ts] = 1;
			setTimeout(() => delete seen[ts], 30000);

			let { tx } = await post(
				'/bitcoin/fee',
				{ address, amount, feeRate, subtract },
				auth(cookies)
			);
			await post('/bitcoin/send', { pin, tx }, auth(cookies));
		} catch (e) {
			return fail(400, { message: e.message });
		}

		throw redirect(307, '/sent');
	}
};
