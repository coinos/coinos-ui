import { get } from "$lib/utils";
import invoice from "$lib/invoice";
import { redirect } from "@sveltejs/kit";

export async function load({ parent }) {
  let rates = await get("/rates");
  let { invoice } = await parent();
  if (!invoice.amount) redirect(307, `/invoice/${invoice.id}`);

  return { rates };
}

export const actions = {
  default: invoice,
};
