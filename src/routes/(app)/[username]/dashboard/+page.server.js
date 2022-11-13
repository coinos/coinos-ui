import { auth, get } from '$lib/utils';

export async function load({ cookies, depends}) {
	depends('app:invoice');
	return get('/requests', auth(cookies));
}
