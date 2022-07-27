import { post } from '$lib/utils';

export async function POST({ request }) {
	let user = await request.json();
	return { body: await post('/register', { user }) };
}
