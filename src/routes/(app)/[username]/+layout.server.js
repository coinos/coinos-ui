import { get } from '$lib/utils';
import { error } from '@sveltejs/kit';

export let load = async ({ depends, params: { username } }) => {
	depends('app:user');

	try {
		return { subject: await get(`/users/${username}`) };
	} catch (e) {
		if (username.length === 64)
			return { subject: { username: username.substr(0, 6), pubkey: username, anon: true } };
		throw error(500, 'Unable to retrieve user account data');
	}
};
