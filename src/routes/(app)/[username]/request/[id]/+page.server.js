import { auth, get } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

export let load = async ({ cookies, depends, params, parent }) => {
	depends('app:invoice');

  let { user } = await parent();
	if (!user) throw redirect(307, '/login');

	let { request } = await get(`/request/${params.id}`, auth(cookies));
	let { invoice } = request;

	if (invoice) {
		let { amount, received, id } = invoice;
		if (
			request.recipient.username === user.username &&
			((received && !amount) || received >= amount)
		)
			throw redirect(307, `/${user.username}/invoice/${id}/paid`);

		if (request.requester.username === user.username) throw redirect(307, `/send/${id}`);
	}


	return { request };
};
