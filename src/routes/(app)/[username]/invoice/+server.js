import { auth, post } from '$lib/utils';
import { json } from '@sveltejs/kit';

export let POST = async ({ cookies: c, request: r }) => {
	let j = await r.json();
	return json(await post('/invoice', j, auth(c)));
};
