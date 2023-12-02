import { error, redirect } from "@sveltejs/kit";
import { auth, post } from "$lib/utils";

export async function load({ cookies, locals, params }) {
  let { user } = locals;

  if (user) {
    try {
      await post("/redeem", params, auth(cookies));
    } catch (e) {
      throw redirect(307, "/");
    }
    throw redirect(307, `/${user.username}/payments`);
  }

  throw redirect(307, "/login");
}
