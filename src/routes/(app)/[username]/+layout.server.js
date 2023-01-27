import { get } from '$lib/utils';
import { error } from '@sveltejs/kit';

export let load = async ({ depends, params: { username } }) => {
	depends('app:user');

	try {
    let subject = await get(`/users/${username}`)
		return { subject  };
	} catch (e) {
		console.log(e);
		throw error(500, 'Unable to retrieve user account data');
	}
};
