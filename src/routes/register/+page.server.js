import { post, login } from '$lib/utils';

export async function POST({ request, setHeaders }) {
	let form = Object.fromEntries(await request.formData());
	let { username, password, redirect } = form;
	await post('/register', { user: { username, password } });
	await login(user, setHeaders);

	return { location: redirect || `/${user.username}/dashboard` };
}
