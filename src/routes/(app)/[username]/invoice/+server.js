import { auth, post } from '$lib/utils';
import { json } from '@sveltejs/kit';

export let POST = async ({ cookies: c, request: r }) =>
	json(await post('/invoice', await r.json(), auth(c)));
