import { get } from '$lib/utils';

export async function load({ params }) {
	let { username } = params;
	let body;

	try {
		body = await get(`/users/${username}`);
	} catch (e) {
		body = {};
	}

	return body;
}
