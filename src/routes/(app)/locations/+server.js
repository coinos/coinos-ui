import { get } from '$lib/utils';
import { json } from '@sveltejs/kit';

export async function GET({ fetch, setHeaders }) {
	setHeaders({ 'cache-control': 'public, max-age=600' });
	return json(await get('/locations'));
}
