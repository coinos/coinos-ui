import { get } from '$lib/utils';

export let load = async ({ params: { username } }) => ({
	subject: await get(`/users/${username}`)
});
