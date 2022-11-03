import { get, post } from '$lib/utils';

export async function load({ params }) {
	let { username } = params;
	return get(`/users/${username}`);
}
