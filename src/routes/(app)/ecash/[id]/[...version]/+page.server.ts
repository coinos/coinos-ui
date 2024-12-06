import getRates from "$lib/rates";
import { auth, fd, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ parent }) {
	const { user } = await parent();
	const rates = await getRates();
	return { rate: rates[user.currency] };
}

export const actions = {
	default: async ({ cookies, request, url }) => {
		if (!cookies.get("username"))
			redirect(307, `/register?redirect=${url.pathname}`);

		const { token } = await fd(request);
		let claimed;
		try {
			claimed = await post("/claim", { token }, auth(cookies));
			claimed = { ok: true };
		} catch (e: any) {
			return fail(400, { error: e.message });
		}
		if (claimed?.ok) {
			redirect(307, "/payments");
		}
	},
};
