import parse from "$lib/parse";
import { fd } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent, url }) {
	const { user } = await parent();
	if (!user) redirect(307, `/register?redirect=${url.pathname}`);
	await parse(params.token, url.host, cookies);
}

export const actions = {
	default: async ({ cookies, request, url }) => {
		const { text } = await fd(request);
		await parse(text, url.host, cookies);
		return fail(400, { error: "default" });
	},
};
