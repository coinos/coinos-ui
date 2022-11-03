import { get } from '$lib/utils';

export const prerender = true;
export let load = async () => get('/locations');
