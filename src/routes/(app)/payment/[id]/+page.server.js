import { auth, get } from "$lib/utils";

export async function load({ cookies, depends, params }) {
  depends("app:payments");
  let payment = await get(`/payments/${params.id}`, auth(cookies));
  return { payment };
}
