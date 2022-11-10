import { redirect } from '@sveltejs/kit';
export async function GET({ locals }) {
	let { user } = locals;
	if (user) throw redirect(307, `/${user.username}/dashboard`);
	throw redirect(307, '/login');
}
