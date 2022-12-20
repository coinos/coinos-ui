import { redirect } from '@sveltejs/kit';

export async function GET() {
	throw new redirect(307, '/#about');
}
