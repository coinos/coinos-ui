import parse from "$lib/parse";
import { auth, fd, get } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

const limit = 10;
export async function load({ cookies, depends, params, parent, url }) {
  depends("app:contacts");
	const { user } = await parent();
	if (!user) redirect(307, "/login");
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
