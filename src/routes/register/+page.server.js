import { post, login } from '$lib/utils';

export async function POST({ request, setHeaders }) {
	let form = Object.fromEntries(await request.formData());
	let { username, password, redirect } = form;

	console.log('REDIRECT', redirect);
	let user = { username, password };
	await post('/register', { user });
	await login(user, setHeaders);

	return { location: redirect || `/${user.username}/dashboard` };
}
