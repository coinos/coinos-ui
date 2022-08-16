import { json as json$1 } from '@sveltejs/kit';
import { post } from '$lib/utils';
export async function POST({ locals, request }) {
	let { token } = locals;
	let body = await request.json();
	body = await post('/lightning/send', body, {
		authorization: `Bearer ${token}`
	});
	throw new Error("@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)");
	// Suggestion (check for correctness before using):
	// return json$1(body);
	return { body };
}
