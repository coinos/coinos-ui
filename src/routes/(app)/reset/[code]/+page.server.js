import { fail, redirect } from "@sveltejs/kit";
import { fd, post, login } from "$lib/utils";

export const actions = {
  default: async ({ cookies, params, request }) => {
    let ip = request.headers.get("cf-connecting-ip");
    let error;

    let { code } = params;
    let { password } = await fd(request);

    try {
      let user = await post("/reset", { code, password });
      user.password = password;

      try {
        await login(user, cookies, ip);
        error = null;
      } catch (e) {
        error ||= e.message;
      }

      if (error) return fail(400, { error });
        throw redirect(307, `/${user.username}`);
    } catch (e) {
      console.log(e.message);
      return fail(400, { error: e.message });
    }
  },
};
