import { fd, get } from "$lib/utils";
import { decodePaymentRequest } from "@cashu/cashu-ts";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, params, url }) {
	if (!cookies.get("token"))
		redirect(307, `/login?redirect=${encodeURIComponent(url.pathname)}`);

	const req = { ...decodePaymentRequest(params.request) };
	const [{ target, type }] = req.transport;

	let recipient = { name: "", pubkey: null };
	if (type === "nostr") {
		recipient = await get(`/profile/${target}`);
	} else if (type === "post") {
		recipient.name = new URL(target).hostname;
	}

	return { req, recipient, type, target };
}

export const actions = {
	setAmount: async ({ request }) => {
		return await fd(request);
	},
};
