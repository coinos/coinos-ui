import { get, fd, login, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ parent }) => {
	const { user } = await parent();
	if (user) redirect(307, `/${user.username}`);

	const index = Math.floor(Math.random() * 64) + 1;
	const { id } = await get("/challenge");

	return { index, id };
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
		} catch (e) {
			({ message: error } = e as Error);
		}

		try {
			await login(user, cookies, ip);
			error = null;
		} catch (e) {
			const { message } = e as Error;
			error ||= message;
		}

		if (error) return fail(400, { error });
		redirect(303, loginRedirect || `/${user.username}`);
	},
};
