import { post, login } from '$lib/utils';

export async function POST({ request, setHeaders }) {
	let user = Object.fromEntries(await request.formData());
	await post('/register', { user });
	await login(user, setHeaders);

	return { location: `/${user.username}/dashboard` };
}
