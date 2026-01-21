import { PUBLIC_COINOS_URL } from "$env/static/public";
import { fd, get, login, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ parent }) => {
	const { user } = await parent();
	if (user?.pubkey) redirect(307, `/${user.username}`);
	const { challenge } = await get("/challenge");
	return { challenge };
};

export const actions = {
	login: async ({ cookies, request }) => {
		const form = await fd(request);
		let { username, password, token, loginRedirect, recaptcha } = form;

		const user = {
			username,
			password,
			token,
			recaptcha,
		};

		if (loginRedirect === "undefined") loginRedirect = undefined;

		try {
			await login(user, cookies, request.headers.get("cf-connecting-ip"));
		} catch (e) {
			const { message } = e as Error;
			return fail(400, { error: "Login failed", message, ...form });
		}

		redirect(307, loginRedirect || `/${user.username}`);
	},

	nostr: async ({ cookies, fetch, request }) => {
		const form = await fd(request);
		let { challenge, event, loginRedirect, recaptcha } = form;
		if (loginRedirect === "null") loginRedirect = undefined;
		event = JSON.parse(event);

		const maxAge = 380 * 24 * 60 * 60;

		const res = await fetch(`${PUBLIC_COINOS_URL}/nostrAuth`, {
			method: "POST",
			body: JSON.stringify({ challenge, event, recaptcha }),
			headers: {
				"content-type": "application/json",
				accept: "application/json",
				"cf-connecting-ip": request.headers.get("cf-connecting-ip"),
			},
		});

		if (res.status === 401) {
			const text = await res.text();
			if (text.startsWith("2fa")) throw new Error("2fa");
		}

		const { user, token } = await res.json();
		if (!token) throw new Error("Login failed");
		const { username, language } = user;

		const expires = new Date();
		expires.setSeconds(expires.getSeconds() + maxAge);

		const opts = { path: "/", expires };
		if (language) cookies.set("lang", language, opts);
		cookies.set("username", username, opts);
		cookies.set("token", token, opts);

		redirect(307, loginRedirect || `/${username}`);
	},
};
