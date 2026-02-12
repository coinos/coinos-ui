import { fail } from "@sveltejs/kit";
import { fd, post } from "$lib/utils";

export const actions = {
  default: async ({ request }) => {
    try {
      const { email } = await fd(request);
      await post("/forgot", { email });
      return { success: true };
    } catch (e: any) {
      return fail(400, { error: e.message });
    }
  },
};
