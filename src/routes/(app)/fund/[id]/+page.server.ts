import { auth, post } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export const actions = {
	default: async ({ cookies, locals, params }) => {
		const { user } = locals;

		if (user) {
			await post("/redeem", params, auth(cookies));
			redirect(307, "/payments");
		}

		redirect(307, "/register");
	},
};
