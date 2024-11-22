import { auth, fd, post } from "$lib/utils";
import { error, redirect } from "@sveltejs/kit";

export const actions = {
	default: async ({ cookies, request }) => {
		let id;
		const body = await fd(request);

		try {
			({ id } = await post("/mint", body, auth(cookies)));
		} catch (e) {
			const { message } = e as Error;
			console.log("problem creating ecash", e);
			error(400, { message });
		}

		redirect(307, `/ecash/${id}`);
	},
};
