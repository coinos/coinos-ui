import { fail, redirect } from "@sveltejs/kit";
import { auth, fd, post } from "$lib/utils";

export const actions = {
  default: async ({ cookies, request }) => {
    let { token } = await fd(request);
    let claimed;
    try {
      claimed = await post(`/claim`, { token }, auth(cookies));
      claimed = { ok: true };
    } catch (e) {
      return fail(400, { error: e.message });
    }
    if (claimed?.ok) {
      redirect(307, `/${cookies.get("username")}/payments`);
    }
  },
};
