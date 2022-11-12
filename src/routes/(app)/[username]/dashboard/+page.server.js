import { auth, get } from '$lib/utils';

export let load = async ({ cookies }) => get('/requests', auth(cookies));
