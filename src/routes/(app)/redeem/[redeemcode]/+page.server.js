import { error, redirect } from "@sveltejs/kit";
import { auth, post } from "$lib/utils";

export async function load({ cookies, locals, params }) {
  let { user } = locals;

  if (user) {
    try {
      await post("/redeem", params, auth(cookies));
    } catch (e) {
      redirect(307, "/");
    }
    redirect(307, `/${user.username}/payments`);
  }

  redirect(307, "/login");
}
