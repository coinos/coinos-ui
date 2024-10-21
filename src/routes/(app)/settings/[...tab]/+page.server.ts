import { auth, fd, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export async function load({ cookies, params, url }) {
	if (url.pathname.endsWith("settings"))
		redirect(307, `${url.pathname}/account`);
	params.cookies = cookies.getAll();
	const subscriptions = await get("/subscriptions", auth(cookies));
	console.log("subs", subscriptions);
	return { cookies: cookies.getAll(), subscriptions, tab: params.tab };
}

export const actions = {
	default: async ({ cookies, request }) => {
		const form = await fd(request);

		if (form.tab === "pos") {
			form.notify = form.notify === "on";
			form.push = form.push === "on";
			form.nip5 = form.nip5 === "on";
			form.prompt = form.prompt === "on";
			form.autowithdraw = form.autowithdraw === "on";
		}

		let user = { ...(await get("/me", auth(cookies))), ...form };

		try {
			({ user } = await post("/user", user, auth(cookies)));
		} catch (e: any) {
			return fail(400, { message: e.message });
		}

		if (user.language) cookies.set("lang", user.language, { path: "/" });

		return { user, success: true };
	},
};
