import { fd, get, register } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export const load = async ({ parent }) => {
	const { user } = await parent();
	if (user) redirect(307, `/${user.username}`);

	const index = Math.floor(Math.random() * 64) + 1;
	const { challenge } = await get("/challenge");

	return { index, challenge };
};

export const actions = {
	default: async ({ cookies, request }) => {
		const ip = request.headers.get("cf-connecting-ip");
		const form = await fd(request);
		const { picture, username, password, challenge } = form;
		let { loginRedirect } = form;
		if (loginRedirect === "undefined") loginRedirect = undefined;

		const user = { picture, username, password, challenge };
		return register(user, ip, cookies, loginRedirect);
	},
};
