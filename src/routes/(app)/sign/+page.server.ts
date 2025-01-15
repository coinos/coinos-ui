import { auth, fd, post, types } from "$lib/utils";

export async function load({ cookies }) {
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
