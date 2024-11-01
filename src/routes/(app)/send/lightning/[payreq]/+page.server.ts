import { auth, fd, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ cookies, params }) {
	return post("/parse", params, auth(cookies));
}

export const actions = {
	setAmount: async ({ request }) => fd(request),

	send: async ({ cookies, request }) => {
		let p;
		try {
			const body = await fd(request);

			p = await post("/payments", body, auth(cookies));
		} catch (e: any) {
			if (
				e.message.includes("unusable") ||
				e.message.includes("routes") ||
				e.message.includes("minflow")
			)
				e.message = "payments.failedToRoute";
			return fail(400, { message: e.message });
		}

		redirect(307, `/sent/${p.id}`);
	},
};
