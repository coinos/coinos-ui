import { fail, redirect } from "@sveltejs/kit";
import { fd, auth, post } from "$lib/utils";

export async function load({ parent }) {
  let { user } = await parent();
  if (!user) redirect(307, "/register");
}

export const actions = {
  default: async ({ cookies, request }) => {
    let body = await fd(request);
    try {
      await post("/take", body, auth(cookies));
    } catch (e: any) {
      return fail(400, { message: e.message });
    }

    redirect(307, `/fund/${body.id}`);
  },
};
