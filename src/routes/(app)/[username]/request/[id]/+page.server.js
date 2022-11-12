import { auth, get } from '$lib/utils';

export let load = async ({ cookies, params }) => get(`/request/${params.id}`, auth(cookies));
