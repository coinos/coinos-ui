import { auth, fd, get } from "$lib/utils";
import { fail } from "@sveltejs/kit";
import parse from "$lib/parse";

export async function load({ cookies, params, url }) {
	const { text } = params;

	await parse(text, url.host);
	const contacts = await get("/contacts", auth(cookies));
	return { contacts };
}

export const actions = {
	default: async ({ request, url }) => {
		const { text } = await fd(request);
		await parse(text, url.host);
		return fail(400, { error: "default" });
	},
};
