import { fail, redirect } from '@sveltejs/kit';
import { auth, post, fd } from '$lib/utils';

let seen = {};
export const actions = {
	default: async ({ cookies, request }) => {
		try {
			let { address, amount, confirmed, feeRate, subtract, pin, stale, ts } = await await fd(
				request
			);
			if (seen[ts]) return fail(400, { message: 'Duplicate form submission' });

			let estimate = await post(
				'/bitcoin/fee',
				{ address, amount, feeRate, subtract },
				auth(cookies)
			);

			let { tx } = estimate;

			if (stale || !confirmed) return fail(400, estimate);

			seen[ts] = 1;
			setTimeout(() => delete seen[ts], 30000);

			await post('/bitcoin/send', { pin, subtract, tx }, auth(cookies));
		} catch (e) {
			return fail(400, { message: e.message });
		}

		throw redirect(307, '/sent');
	}
};
