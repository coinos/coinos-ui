import { redirect } from "@sveltejs/kit";
import { auth, post } from "$lib/utils";
import type { Invoice } from "$lib/types";

export let load = async ({ cookies, params, parent }) => {
  let { account } = params;
  let {subject, user, rates } = await parent();

  let invoice: Invoice = {
    account,
    type: account ? "bitcoin": "lightning",
    rate: rates[user?.currency || subject?.currency],
  };

  if(!user) user = subject;
  invoice = await post("/invoice", { invoice, account, user }, auth(cookies));
  let { id } = invoice;

  if (invoice.memoPrompt && !invoice.memo) {
    redirect(307, `/${user.username}/invoice/${id}/memo`);
  } else redirect(307, `/${user.username}/invoice/${id}`);
};
