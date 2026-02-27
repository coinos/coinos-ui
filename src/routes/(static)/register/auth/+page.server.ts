import { fd, get, login, post } from "$lib/utils";
import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ parent, url }) => {
  const { user } = await parent();
  if (user) redirect(307, `/${user.username}`);

  const username = url.searchParams.get("username");
  if (!username) redirect(307, "/register");

  const { challenge } = await get("/challenge");

  return { username, challenge };
};

export const actions = {
  register: async ({ cookies, request }) => {
    const ip = request.headers.get("cf-connecting-ip") ?? "";
    const host = request.headers.get("host") ?? "";
    const form = await fd(request);
    const { picture, username, password, challenge, recaptcha, authPubkey } = form;
    let { loginRedirect } = form;
    if (loginRedirect === "undefined") loginRedirect = undefined;

    const user = {
      picture,
      username,
      password,
      challenge,
      recaptcha,
      authPubkey: authPubkey || undefined,
    };

    const headers: Record<string, string> = {};
    if (ip) headers["cf-connecting-ip"] = ip;

    try {
      const { sk, token } = await post("/register", { user }, headers);

      // Log the user in and set cookies
      await login(user, cookies, ip, host);

      // Set sk cookie if server generated one
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
    } catch (e) {
      const { message } = e as Error;
      return fail(400, { error: message });
    }

    redirect(303, loginRedirect || `/${username}`);
  },

  passkeyCreate: async ({ request }) => {
    const ip = request.headers.get("cf-connecting-ip") ?? "";
    const form = await fd(request);
    const { username, password, challenge, recaptcha, picture } = form;

    const user = { picture, username, password, challenge, recaptcha };
    const headers: Record<string, string> = {};
    if (ip) headers["cf-connecting-ip"] = ip;

    try {
      const { sk, token } = await post("/register", { user }, headers);
      return { token, username, sk };
    } catch (e) {
      const { message } = e as Error;
      return fail(400, { error: message });
    }
  },

  activate: async ({ cookies, request }) => {
    const form = await fd(request);
    const { token, username, sk, pubkey } = form;
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

    if (pubkey) {
      try {
        await post("/user", { pubkey }, { authorization: `Bearer ${token}` });
      } catch (e) {
        console.log("Failed to update pubkey:", e);
      }
    }

    redirect(303, loginRedirect || `/${username}`);
  },
};
