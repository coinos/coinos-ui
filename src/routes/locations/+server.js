import { json } from '@sveltejs/kit';

export async function GET({ fetch, setHeaders }) {
	let r = await fetch('https://api.btcmap.org/v2/elements?updated_since=2022-09-19');

	let locations = await r.json();
	locations = locations.filter(
		(l) => l['osm_json'].tags && l['osm_json'].tags['payment:coinos'] === 'yes'
	);

	let headers = {
		'cache-control': 'public, max-age=600'
	};

	setHeaders(headers);

	return json({ locations });
}
