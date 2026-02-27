import { PUBLIC_COINOS_URL } from "$env/static/public";
import { fd, get, login } from "$lib/utils";
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
    let { username, password, token, loginRedirect, recaptcha, authPubkey } = form;
    username = username.split("@")[0];

    const user = {
      username,
      password,
      token,
      recaptcha,
      authPubkey: authPubkey || undefined,
    };

    if (loginRedirect === "undefined") loginRedirect = undefined;

    try {
      const u = await login(
        user,
        cookies,
        request.headers.get("cf-connecting-ip") ?? "",
        request.headers.get("host") ?? "",
      );

      return {
        encryptedKeys: u?.encryptedKeys || null,
        redirectUrl: loginRedirect || `/${user.username}`,
      };
    } catch (e) {
      const { message } = e as Error;
      return fail(400, { error: "Login failed", message, ...form });
    }
  },

  passwordAuth: async ({ cookies, fetch, request }) => {
    const form = await fd(request);
    let { event, challenge, username, loginRedirect, recaptcha, token: twofa } = form;
    if (loginRedirect === "null" || loginRedirect === "undefined") loginRedirect = undefined;
    event = JSON.parse(event);

    const maxAge = 380 * 24 * 60 * 60;

    const res = await fetch(`${PUBLIC_COINOS_URL}/authKeyLogin`, {
      method: "POST",
      body: JSON.stringify({ event, challenge, username, recaptcha, twofa }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "cf-connecting-ip": request.headers.get("cf-connecting-ip") ?? "",
        "x-forwarded-host": request.headers.get("host") ?? "",
      },
    });

    const text = await res.text();

    if (res.status === 401) {
      if (text.startsWith("2fa")) throw new Error("2fa");
      throw new Error(text);
    }

    if (!res.ok) {
      let message;
      try {
        ({ message } = JSON.parse(text));
      } catch {
        message = text;
      }
      return fail(400, { error: message || "Login failed" });
    }

    const { user, token } = JSON.parse(text);
    if (!token) return fail(400, { error: "Login failed" });
    const { username: uname, language } = user;

    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + maxAge);

    const opts = { path: "/", expires };
    if (language) cookies.set("lang", language, opts);
    cookies.set("username", uname, opts);
    cookies.set("token", token, opts);

    return {
      encryptedKeys: user.encryptedKeys || null,
      redirectUrl: loginRedirect || `/${uname}`,
    };
  },

  passwordAuth: async ({ cookies, fetch, request }) => {
    const form = await fd(request);
    let { event, challenge, username, loginRedirect, recaptcha, token: twofa } = form;
    if (loginRedirect === "null" || loginRedirect === "undefined") loginRedirect = undefined;
    event = JSON.parse(event);

    const maxAge = 380 * 24 * 60 * 60;

    const res = await fetch(`${PUBLIC_COINOS_URL}/authKeyLogin`, {
      method: "POST",
      body: JSON.stringify({ event, challenge, username, recaptcha, twofa }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "cf-connecting-ip": request.headers.get("cf-connecting-ip") ?? "",
        "x-forwarded-host": request.headers.get("host") ?? "",
      },
    });

    const text = await res.text();

    if (res.status === 401) {
      if (text.startsWith("2fa")) throw new Error("2fa");
      throw new Error(text);
    }

    if (!res.ok) {
      let message;
      try {
        ({ message } = JSON.parse(text));
      } catch {
        message = text;
      }
      return fail(400, { error: message || "Login failed" });
    }

    const { user, token } = JSON.parse(text);
    if (!token) return fail(400, { error: "Login failed" });
    const { username: uname, language } = user;

    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + maxAge);

    const opts = { path: "/", expires };
    if (language) cookies.set("lang", language, opts);
    cookies.set("username", uname, opts);
    cookies.set("token", token, opts);

    redirect(307, loginRedirect || `/${uname}`);
  },

  passkey: async ({ cookies, fetch, request }) => {
    const form = await fd(request);
    let { credential, challengeId, loginRedirect } = form;
    if (loginRedirect === "null" || loginRedirect === "undefined") loginRedirect = undefined;
    credential = JSON.parse(credential);

    const maxAge = 380 * 24 * 60 * 60;

    const origin = new URL(request.url).origin;
    const res = await fetch(`${PUBLIC_COINOS_URL}/passkey/login/verify`, {
      method: "POST",
      body: JSON.stringify({ credential, challengeId, origin }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "cf-connecting-ip": request.headers.get("cf-connecting-ip") ?? "",
        "x-forwarded-host": request.headers.get("host") ?? "",
      },
    });

    const text = await res.text();
    if (!res.ok) {
      let message;
      try {
        ({ message } = JSON.parse(text));
      } catch {
        message = text;
      }
      return fail(400, { error: message || "Passkey login failed" });
    }

    const { user, token } = JSON.parse(text);
    if (!token) return fail(400, { error: "Login failed" });
    const { username, language } = user;

    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + maxAge);

    const opts = { path: "/", expires };
    if (language) cookies.set("lang", language, opts);
    cookies.set("username", username, opts);
    cookies.set("token", token, opts);

    return {
      encryptedKeys: user.encryptedKeys || null,
      redirectUrl: loginRedirect || `/${username}`,
    };
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
        "cf-connecting-ip": request.headers.get("cf-connecting-ip") ?? "",
        "x-forwarded-host": request.headers.get("host") ?? "",
      },
    });

    const text = await res.text();

    if (res.status === 401) {
      if (text.startsWith("2fa")) throw new Error("2fa");
      throw new Error(text);
    }

    const { user, token } = JSON.parse(text);
    if (!token) throw new Error("Login failed");
    const { username, language } = user;

    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + maxAge);

    const opts = { path: "/", expires };
    if (language) cookies.set("lang", language, opts);
    cookies.set("username", username, opts);
    cookies.set("token", token, opts);

    return {
      encryptedKeys: user.encryptedKeys || null,
      redirectUrl: loginRedirect || `/${username}`,
    };
  },
};
