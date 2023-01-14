import { auth, get } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export let load = async ({ cookies, depends, locals: { user }, params }) => {
	depends('app:invoice');
	if (!user) throw redirect(307, '/login');

	let { request } = await get(`/request/${params.id}`, auth(cookies));
	let { invoice } = request;

	if (invoice) {
		let { amount, received, id } = invoice;
		if (
			request.recipient.username === user.username &&
			((received && !amount) || received >= amount)
		)
			throw redirect(307, `/invoice/${id}/paid`);

		if (request.requester.username === user.username) throw redirect(307, `/send/${id}`);
	}

	return { request };
};
