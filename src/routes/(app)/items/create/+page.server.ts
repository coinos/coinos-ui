import { fail, redirect } from "@sveltejs/kit";
import { fd, auth, post } from "$lib/utils";

export const actions = {
  default: async ({ cookies, request, url }) => {
    const form = await fd(request);
    try {
      await post("/items", form, auth(cookies));
    } catch (e: any) {
      return fail(400, { message: e.message });
    }

    const success = `/${url.pathname.split("/")[1]}`;
    redirect(307, success);
  },
};
