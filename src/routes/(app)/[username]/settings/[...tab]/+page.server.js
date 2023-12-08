import { fail, redirect } from "@sveltejs/kit";
import { fd, auth, get, post } from "$lib/utils";

export function load({ cookies, params, url }) {
  if (url.pathname.endsWith("settings"))
    throw redirect(307, url.pathname + "/account");
  params.cookies = cookies.getAll();
  return params;
}

export const actions = {
  default: async ({ cookies, request }) => {
    let form = await fd(request);

    if (form.tab === "pos") {
      form.notify = form.notify === "on";
      form.nip5 = form.nip5 === "on";
      form.prompt = form.prompt === "on";
    }

    let user = { ...(await get("/me", auth(cookies))), ...form };

    try {
      ({ user } = await post(`/user`, user, auth(cookies)));
    } catch (e) {
      return fail(400, { message: e.message });
    }

    return { user, success: true };
  },
};
