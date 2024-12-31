import { fd, login, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

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
			console.log("ST", Date.now());
			await post("/register", { user }, { "cf-connecting-ip": ip });
			console.log("END", Date.now());
		} catch (e) {
			({ message: error } = e as Error);
		}

		try {
			console.log("ST", Date.now());
			await login(user, cookies, ip);
			console.log("END", Date.now());
			error = null;
		} catch (e) {
			const { message } = e as Error;
			error ||= message;
		}

		if (error) return fail(400, { error });
		redirect(303, loginRedirect || `/${user.username}`);
	},
};
