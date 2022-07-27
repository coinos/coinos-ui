import { post } from '$lib/utils';

export async function POST({ request }) {
	return { body: await post('/login', await request.json()) };
}
