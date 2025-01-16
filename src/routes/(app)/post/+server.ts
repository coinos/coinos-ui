export async function POST({ cookies, params, request }) {
	const body = await request.json();
	try {
		const result = await post("/event", body, auth(cookies));
		return json(result);
	} catch (e: any) {
		error(500, e.message);
	}
}
