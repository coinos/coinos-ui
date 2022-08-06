import { post } from '$lib/utils';
export async function POST({ locals, request }) {
	let { token } = locals;
	let body = await request.json();
	body = await post('/lightning/send', body, {
		authorization: `Bearer ${token}`
	});
	return { body };
}
