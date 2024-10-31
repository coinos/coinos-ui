import { redirect } from "@sveltejs/kit";
import { auth, get, post } from "$lib/utils";
import Qr from "qrcode-base64";

export const load = async ({ params: { id }, url }) => {
	const { amount, payments } = await get(`/fund/${id}`);

	const src = Qr.drawImg(url.href, { size: 300 });
	return { amount, payments, src };
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
