import getRates from "$lib/rates";
import { auth, get, post } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export const load = async ({ depends, params: { id }, parent }) => {
	depends("app:payments");
	const data = await get(`/fund/${id}`);
	const rates = await getRates();
	const { user } = await parent();
	data.rate = rates[user?.currency || "USD"];
	return data;
};

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
