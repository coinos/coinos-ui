import { get } from '$lib/utils';
import { error } from '@sveltejs/kit';

export let load = async ({ params: { username } }) => {
	try {
		return { subject: await get(`/users/${username}`) };
	} catch (e) {
    if (username.length === 64) return { subject: { username }}
		throw error(500, 'Unable to retrieve user account data');
	}
};
