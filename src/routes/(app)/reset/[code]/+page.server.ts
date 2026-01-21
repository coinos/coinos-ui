import { fail, redirect } from "@sveltejs/kit";
import { fd, post, login } from "$lib/utils";

export const actions = {
	default: async ({ cookies, params, request }) => {
		const ip = request.headers.get("cf-connecting-ip");
		let error;

		const { code } = params;
		const { password, recaptcha } = await fd(request);

		try {
			const user = await post("/reset", { code, password });
			user.password = password;
			user.recaptcha = recaptcha;

			try {
				await login(user, cookies, ip);
				error = null;
			} catch (e: any) {
				error ||= e.message;
			}

			if (error) return fail(400, { error });
			redirect(307, `/${user.username}`);
		} catch (e: any) {
			console.log(e.message);
			return fail(400, { error: e.message });
		}
	},
};
