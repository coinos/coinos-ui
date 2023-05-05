import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	let { url, pr } = await request.json();

  console.log("URL", url);
  console.log("URL", pr);

	let { callback, k1 } = await fetch(url, {
		headers: { 'content-type': 'application/json' }
	}).then((r) => r.json());

  console.log("CB", callback, k1)

	let result = await fetch(callback + `?pr=${pr}&k1=${k1}`, {
		headers: { 'content-type': 'application/json' }
	}).then((r) => r.json());

	console.log("RESULT", result);
	return json(result);
}
