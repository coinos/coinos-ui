import { get } from '$lib/utils';
import { json } from '@sveltejs/kit';

export async function GET({ fetch, setHeaders }) {
	let locations = [];

	try {
		({ locations } = await get('/locations'));
		setHeaders({ 'cache-control': 'public, max-age=600' });
	} catch (e) {
		console.log('failed to fetch locations');
	}

	return json({ locations });
}
