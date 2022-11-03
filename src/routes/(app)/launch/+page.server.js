import { auth, get } from '$lib/utils';

export const load = async ({ parent }) => {
	let tickets = await get('/tickets');
	return { ...(await parent()), tickets };
};
