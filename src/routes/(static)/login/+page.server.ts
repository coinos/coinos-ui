import { fd, login } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ parent }) => {
	const { user } = await parent();
	if (user?.pubkey) redirect(307, `/${user.username}`);
};

export const actions = {
	default: async ({ cookies, request }) => {
		const form = await fd(request);
		let { username, password, token, loginRedirect } = form;
		const user = { username, password, token };

		console.log("LOGIN", user);

		if (loginRedirect === "undefined") loginRedirect = undefined;

		try {
			await login(user, cookies, request.headers.get("cf-connecting-ip"));
		} catch (e: any) {
			return fail(400, { error: "Login failed", message: e.message, ...form });
		}

		redirect(307, loginRedirect || `/${user.username}`);
	},
};
