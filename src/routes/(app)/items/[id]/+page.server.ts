import { fd, auth, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ params: { id } }) => {
	const item = await get(`/items/${id}`);
	return { item };
};

export const actions = {
	default: async ({ cookies, request, url }) => {
		const form = await fd(request);
		try {
			await post("/items", form, auth(cookies));
		} catch (e: any) {
			return fail(400, { message: e.message });
		}

		const success = `/${url.pathname.split("/")[1]}`;
		redirect(307, success);
	},
};
