import { fd, get } from "$lib/utils";
import { decodePaymentRequest } from "@cashu/cashu-ts";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, params, url }) {
	if (!cookies.get("token"))
		redirect(307, `/login?redirect=${encodeURIComponent(url.pathname)}`);

	const req = { ...decodePaymentRequest(params.request) };
	const { target } = req.transport[0];
	const recipient = await get(`/profile/${target}`);
	return { req, recipient };
}

export const actions = {
	setAmount: async ({ request }) => {
		return await fd(request);
	},
};
