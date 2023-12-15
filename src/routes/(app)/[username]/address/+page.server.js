import { auth, get, post } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent }) {
  let user = (await parent()).subject;
  let rates = await get("/rates");
  let invoice = { type: "bitcoin" };
  let { hash } = await post(`/invoice`, { invoice, user }, auth(cookies));
  redirect(307, `/${user.username}/invoice/${hash}`);
}
