import cookie from 'cookie';
import { post, login } from '$lib/utils';

let maxAge = 30 * 24 * 60 * 60;

export async function POST({ request, setHeaders }) {
	let user = Object.fromEntries(await request.formData());
	await post('/register', { user });
	await login(user, setHeaders);

	return { location: `/${user.username}/dashboard` };
}
