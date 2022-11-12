import { auth, get } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export let load = async ({ cookies, depends, locals: { user }, params }) => {
	depends('app:invoice');
	if (!user) throw redirect(307, '/login');

	let { request } = await get(`/request/${params.id}`, auth(cookies));
	let { invoice } = request;
	if (invoice) {
		let { amount, received, uuid } = invoice;
		if ((received && !amount) || received >= amount) throw redirect(307, `/send/${uuid}`);

		if (request.requester.username === user.username)
			throw redirect(307, `/send/${request.invoice.uuid}`);
	}

	return { request };
};
