import { fail, redirect } from "@sveltejs/kit";
import { auth, post, fd } from "$lib/utils";

export const actions = {
  default: async ({ cookies, request }) => {
    let token;
    try {
      let body = await fd(request);
      ({ token } = await post("/mint", body, auth(cookies)));
    } catch (e) {
      console.log("problem creating ecash", e);
      return fail(400, { message: e.message });
    }

    cookies.set("ecash", token, { path: "/" });

    redirect(307, `/${cookies.get("username")}/ecash`);
  },
};
