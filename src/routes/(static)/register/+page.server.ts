import { fd, get, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ parent }) => {
  const { user } = await parent();
  if (user) redirect(307, `/${user.username}`);

  const index = Math.floor(Math.random() * 64) + 1;
  const { challenge } = await get("/challenge");

  return { index, challenge };
};

export const actions = {
  register: async ({ request }) => {
    const ip = request.headers.get("cf-connecting-ip");
    const form = await fd(request);
    const { picture, username, challenge, recaptcha, pubkey } = form;

    const user = { picture, username, challenge, recaptcha, pubkey };
    const headers: Record<string, string> = {};
    if (ip) headers["cf-connecting-ip"] = ip;

    try {
      const { sk, token } = await post("/register", { user }, headers);
      return { token, sk, username };
    } catch (e) {
      const { message } = e as Error;
      return fail(400, { error: message });
    }
  },

  activate: async ({ cookies, request }) => {
    const form = await fd(request);
    const { token, username, sk } = form;
    let { loginRedirect } = form;
    if (loginRedirect === "undefined") loginRedirect = undefined;

    const maxAge = 380 * 24 * 60 * 60;
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + maxAge);
    const opts = { path: "/", expires };

    cookies.set("username", username, opts);
    cookies.set("token", token, opts);

    if (sk) {
      const skExpires = new Date();
      skExpires.setSeconds(skExpires.getSeconds() + 21000000);
      cookies.set("sk", sk, {
        path: "/",
        expires: skExpires,
        httpOnly: false,
        sameSite: "lax",
      });
    }

    redirect(303, loginRedirect || `/${username}`);
  },
};
