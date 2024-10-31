import { fail, redirect } from "@sveltejs/kit";
import { fd, post, login } from "$lib/utils";

export const load = async ({ parent }) => {
	const { user } = await parent();
	if (user) redirect(307, `/${user.username}`);

	const index = Math.floor(Math.random() * 64) + 1;

	return { index };
};

export const actions = {
	default: async ({ cookies, request }) => {
		const ip = request.headers.get("cf-connecting-ip");

		const form = await fd(request);
		let { profile, username, password, cipher, salt, pubkey, loginRedirect } =
			form;
		const user = { profile, username, password, cipher, salt, pubkey };
		let error;

		if (loginRedirect === "undefined") loginRedirect = undefined;

		try {
			await post("/register", { user }, { "cf-connecting-ip": ip });
		} catch (e: any) {
			error = e.message;
		}

		try {
			await login(user, cookies, ip);
			error = null;
		} catch (e: any) {
			error ||= e.message;
		}

		if (error) return fail(400, { error });
		redirect(307, loginRedirect || `/${user.username}`);
	},
};
