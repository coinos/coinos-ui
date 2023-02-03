import { redirect } from '@sveltejs/kit';
export async function load({ params: { username } }) {
	throw redirect(301, `/${username}`);
}
