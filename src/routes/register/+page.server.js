import { post } from '$lib/utils';
import { error } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		let user = await request.json();
		await post('/register', { user });
	} catch (e) {
		throw error(500, e.message);
	}
}
