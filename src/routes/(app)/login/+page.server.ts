import { fail, redirect } from "@sveltejs/kit";
import { login, fd } from "$lib/utils";

export const load = async ({ parent }) => {
  let { user } = await parent();
  if (user?.pubkey) redirect(307, `/${user.username}`);
};

export const actions = {
  default: async ({ cookies, request }) => {
    let form = await fd(request);
    let { username, password, token, loginRedirect } = form;
    let user = { username, password, token };

    if (loginRedirect === "undefined") loginRedirect = undefined;

    try {
      await login(
        user,
        cookies,
        request.headers.get("cf-connecting-ip")
      );
    } catch (e: any) {
      return fail(400, { error: "Login failed", message: e.message, ...form });
    }

    redirect(307, loginRedirect || `/${user.username}`);
  },
};
