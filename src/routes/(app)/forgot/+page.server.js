import { fail, redirect } from "@sveltejs/kit";
import { fd, post, login } from "$lib/utils";

export const actions = {
  default: async ({ request }) => {
    try {
      let { email } = await fd(request);
      await post("/forgot", { email });
      return { success: true };
    } catch (e) {
      return fail(400, { error: e.message });
    }
  },
};
