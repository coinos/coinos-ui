import { get, auth, post } from "$lib/utils";
import { redirect } from "@sveltejs/kit";

export async function load({ cookies, params, parent }) {
  let { user } = await parent();
  let { id } = params;
  let { amount } = await get(`/fund/${id}`);

  if (!amount) redirect(307, `/fund/${id}`);
  if (!user) redirect(307, `/register?redirect=/fund/${id}/sweep`);
  await post("/take", { amount, id }, auth(cookies));
  return { amount, id };
}
