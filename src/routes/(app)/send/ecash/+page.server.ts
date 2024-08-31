import { error, redirect } from "@sveltejs/kit";
import { auth, post, fd } from "$lib/utils";

export const actions = {
  default: async ({ cookies, request }) => {
    let id;
    let body = await fd(request);

    try {
      ({ id } = await post("/mint", body, auth(cookies)));
    } catch (e: any) {
      console.log("problem creating ecash", e);
      error(400, { message: e.message });
    }

    redirect(307, `/ecash/${id}`);
  },
};
