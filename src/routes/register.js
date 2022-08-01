import { post } from '$lib/utils';

export async function POST({ request }) {
	try {
		let user = await request.json();
		let body = await post('/register', { user });
		return { body };
	} catch (e) {
		return {
			status: 500,
			body: e
		};
	}
}
