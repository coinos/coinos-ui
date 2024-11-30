import parse from "$lib/parse";
import { auth, fd, get } from "$lib/utils";
import { fail } from "@sveltejs/kit";

const limit = 1;
export async function load({ cookies, params, url }) {
	const { text } = params;

	await parse(text, url.host);
	const contacts = await get(`/contacts/${limit}`, auth(cookies));
	return { contacts };
}

export const actions = {
	default: async ({ request, url }) => {
		const { text } = await fd(request);
		await parse(text, url.host);
		return fail(400, { error: "default" });
	},
};
