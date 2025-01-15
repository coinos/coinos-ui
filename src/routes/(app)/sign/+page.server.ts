import { auth, fd, post, types } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, parent, url }) {
	const { user } = await parent();
	if (!user) redirect(307, `/register?redirect=${url.pathname}`);

	const invoice = {
		address_type: "legacy",
		type: types.bitcoin,
	};

	const { text: address } = await post("/invoice", { invoice }, auth(cookies));

	return { address };
}

export const actions = {
	default: async ({ cookies, request }) => {
		const body = await fd(request);
		return post("/sign", body, auth(cookies));
	},
};
