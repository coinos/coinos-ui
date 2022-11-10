import { get } from '$lib/utils';
import { error } from '@sveltejs/kit';

export let load = async ({ params: { username } }) => {
	try {
		return { subject: await get(`/users/${username}`) };
	} catch (e) {
		throw error(500, 'Unable to retrieve user account data');
	}
};
