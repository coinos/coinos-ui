import { fail, redirect } from "@sveltejs/kit";
import { fd, post, login } from "$lib/utils";

export const actions = {
  default: async ({ request }) => {
    let { email } = await fd(request);

    try {
      await post("/forgot", { email });
      return { success: true };
    } catch (e) {
      console.log(e.message);
      return fail(400, { error: e.message });
    }
  },
};
