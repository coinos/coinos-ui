import { get } from '$lib/utils';

export const prerender = true;
export let load = async () => {
	try {
		let locations = await get('/locations');
		return locations;
	} catch (e) {}
};
