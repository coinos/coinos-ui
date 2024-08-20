import { fail, redirect } from "@sveltejs/kit";
import { auth, post, fd } from "$lib/utils";

export const actions = {
  default: async ({ cookies, request }) => {
    let id;
    try {
      let body = await fd(request);
      ({ id } = await post("/mint", body, auth(cookies)));
    } catch (e) {
      console.log("problem creating ecash", e);
      return fail(400, { message: e.message });
    }

    redirect(307, `/ecash/${id}`);
  },
};
