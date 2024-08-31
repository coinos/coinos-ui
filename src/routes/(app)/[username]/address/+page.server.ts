import { auth, post } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, parent }) {
  let user = (await parent()).subject;
  let invoice = { type: "bitcoin" };
  let { id } = await post(`/invoice`, { invoice, user }, auth(cookies));
  redirect(307, `/${user.username}/invoice/${id}`);
}
