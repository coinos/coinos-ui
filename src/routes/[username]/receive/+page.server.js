import { auth, post } from '$lib/utils';

export const actions = {
	default: async ({ cookies, request, parent }) => {
		let { rate, user } = await parent();
		let invoice = Object.fromEntries(await request.formData());
		invoice.rate = rate;

		let { uuid } = await post('/invoice', { invoice, user }, auth(cookies));
		throw redirect(303, `/invoice/${uuid}`);
	}
};
