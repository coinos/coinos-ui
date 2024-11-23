import { json } from "@sveltejs/kit";

export async function POST({ fetch, request }) {
	const { target, payload } = await request.json();
	const res = await fetch(target, {
		method: "POST",
		body: JSON.stringify(payload),
	});
	return json(res);
}
