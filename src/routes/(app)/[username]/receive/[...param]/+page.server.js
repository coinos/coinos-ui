import { redirect } from "@sveltejs/kit";
import { auth, post } from "$lib/utils";
import invoice from "$lib/invoice";

export let load = async ({ cookies, parent }) => {
  let { user, rates } = await parent();

  let invoice = {
    type: "lightning",
    rate: rates[user.currency],
  };

  invoice = await post("/invoice", { invoice, user }, auth(cookies));
  let { id } = invoice;

  if (invoice.memoPrompt && !invoice.memo) {
    redirect(307, `/${user.username}/invoice/${id}/memo`);
  } else redirect(307, `/${user.username}/invoice/${id}`);
};
