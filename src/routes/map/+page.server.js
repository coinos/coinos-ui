import { get } from '$lib/utils';

// export const prerender = true;
export let load = async () => {
	let data = { locations: [] };

	try {
		data = await get('/locations');
	} catch (e) {}

	return data;
};
