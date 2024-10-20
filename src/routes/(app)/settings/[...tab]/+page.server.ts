import { fail, redirect } from "@sveltejs/kit";
import { fd, auth, get, post } from "$lib/utils";

export function load({ cookies, params, url }) {
  if (url.pathname.endsWith("settings"))
    redirect(307, url.pathname + "/account");
  params.cookies = cookies.getAll();
  return { cookies: cookies.getAll(), tab: params.tab };
}

export const actions = {
  default: async ({ cookies, request }) => {
    let form = await fd(request);

    if (form.tab === "pos") {
      form.notify = form.notify === "on";
      form.push = form.push === "on";
      form.nip5 = form.nip5 === "on";
      form.prompt = form.prompt === "on";
      form.autowithdraw = form.autowithdraw === "on";
    }

    let user = { ...(await get("/me", auth(cookies))), ...form };

    try {
      ({ user } = await post(`/user`, user, auth(cookies)));
    } catch (e: any) {
      return fail(400, { message: e.message });
    }

    if (user.language) cookies.set("lang", user.language, { path: "/" });

    return { user, success: true };
  },
};
