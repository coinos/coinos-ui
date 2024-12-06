import getRates from "$lib/rates";
import { auth, get, post } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export const load = async ({ params: { id } }) => {
	const data = await get(`/fund/${id}`);
	data.rate = await getRates();
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
