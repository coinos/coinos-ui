import { post } from '$lib/utils';

export async function POST({ request }) {
	try {
		let user = await request.json();
		let body = await post('/register', { user });
		throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292699)");
		return { body };
	} catch (e) {
		throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292699)");
		return {
			status: 500,
			body: e
		};
	}
}
